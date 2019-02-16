const WebhooksApi = require('@octokit/webhooks')
const db = require('../lib/db/')
const log = require('../lib/log')
const install = require('../lib/install')
const scan = require('../lib/scan/repo')

const webhooks = new WebhooksApi({ secret: process.env.GITHUB_WEBHOOK_SECRET })

webhooks.on('*', ({ id, name, payload: { installation } }) => {
  log('%s:blue %s:green %s:gray', installation.id, name, id)
})

// installation added
webhooks.on('installation.created', ({ payload: { installation } }) => {
  // install & scan repositories
  install(installation)
})

// installation removed
webhooks.on('installation.deleted', ({ payload: { installation } }) => {
  db.installation.remove(installation.id)
})

// installation updated (repositories added)
webhooks.on('installation_repositories.added', ({ payload: { installation, repositories_added } }) => {
  log('%s:blue adding %d:cyan repositories', installation.id, repositories_added.length)

  repositories_added.map(repository => {
    db.repository.add(installation.id, repository)
  })
})

// installation updated (repos removed)
webhooks.on('installation_repositories.removed', ({ payload: { installation, repositories_removed } }) => {
  log('%s:blue removing %d:cyan repositories', installation.id, repositories_removed.length)

  repositories_removed.map(repo => {
    db.repository.remove(installation.id, repo.id)
  })
})

webhooks.on('repository.created', ({ payload: { installation, repository } }) => {
  log('%s:blue adding %s:cyan', installation.id, repository.full_name)

  db.repository.add(installation.id, repository)
})

webhooks.on('repository.deleted', ({ payload: { installation, repository } }) => {
  log('%s:blue removing %s:cyan', installation.id, repository.full_name)

  db.repository.remove(installation.id, repository.id)
})

webhooks.on('push', ({ payload }) => {
  const { installation, repository, ref, commits } = payload

  const defaultBranch = ref === 'refs/heads/' + repository.default_branch

  const colophonModified = commits.find(commit => {
    return commit.added.includes('.colophon.yml') ||
      commit.modified.includes('.colophon.yml')
  })

  if (defaultBranch && colophonModified) {
    log('%s:blue scanning %s:cyan', installation.id, repository.full_name)

    scan(installation.id, repository.owner.login, repository.name)
  } else {
    log('%s:blue no relevant changes to %s:yellow/%s:yellow', installation.id, repository.owner.login, repository.name)
  }
})

module.exports = webhooks.middleware
