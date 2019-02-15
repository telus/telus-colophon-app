const WebhooksApi = require('@octokit/webhooks')
const db = require('../lib/db')
const log = require('../lib/log')
const install = require('../lib/events/install')
const scan = require('../lib/events/scan')

const webhooks = new WebhooksApi({ secret: process.env.GITHUB_WEBHOOK_SECRET })

webhooks.on('*', ({ id, name, payload: { installation } }) => {
  log('%s:blue %s:green %s:gray', installation.id, name, id)
})

// installation added
webhooks.on('installation.created', ({ payload: { installation } }) => {
  // add installation
  db.install(installation)

  // scan repositories
  install(installation)
})

// installation removed
webhooks.on('installation.deleted', ({ payload: { installation } }) => {
  db.uninstall(installation.id)
})

// installation updated (repositories added)
webhooks.on('installation_repositories.added', ({ payload: { installation, repositories_added } }) => {
  log('%s:blue adding %d:cyan repositories', installation.id, repositories_added.length)

  repositories_added.map(repository => {
    db.upsert(installation.id, repository)
  })
})

// installation updated (repos removed)
webhooks.on('installation_repositories.removed', ({ payload: { installation, repositories_removed } }) => {
  log('%s:blue removing %d:cyan repositories', installation.id, repositories_removed.length)

  repositories_removed.map(repo => {
    db.remove(installation.id, repo.id)
  })
})

webhooks.on('repository.created', ({ payload: { installation, repository } }) => {
  log('%s:blue adding %s:cyan', installation.id, repository.full_name)

  db.upsert(installation.id, repository)
})

webhooks.on('repository.deleted', ({ payload: { installation, repository } }) => {
  log('%s:blue removing %s:cyan', installation.id, repository.full_name)

  db.remove(installation.id, repository.id)
})

webhooks.on('push', ({ payload }) => {
  const defaultBranch = payload.ref === 'refs/heads/' + payload.repository.default_branch

  const colophonModified = payload.commits.find(commit => {
    return commit.added.includes('.colophon.yml') ||
      commit.modified.includes('.colophon.yml')
  })

  if (defaultBranch && colophonModified) {
    log('%s:blue scanning %s:cyan', payload.installation.id, payload.repository.full_name)

    scan(payload.installation, payload.repository)
  } else {
    log('%s:blue no relevant changes to %s:cyan', payload.installation.id, payload.repository.full_name)
  }
})

module.exports = webhooks.middleware
