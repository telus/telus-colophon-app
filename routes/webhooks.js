const WebhooksApi = require('@octokit/webhooks')
const db = require('../lib/db')
const log = require('../lib/log')
const install = require('../lib/events/install')
const repository = require('../lib/events/repository')

const webhooks = new WebhooksApi({ secret: process.env.GITHUB_WEBHOOK_SECRET })

webhooks.on('*', ({ id, name, payload }) => {
  log('new event %s:blue %s:gray', name, name)
})

// installation added
webhooks.on('installation.created', ({ payload }) => {
  install(payload.installation)
})

// installation removed
webhooks.on('installation.deleted', async ({ payload }) => {
  db.uninstall(payload.installation.id)
})

// installation updated (repositories added)
webhooks.on('installation_repositories.added', ({ payload }) => {
  payload.repositories_added.map(repo => {
    repository(payload.installation, repo)
  })
})

// installation updated (repos removed)
webhooks.on('installation_repositories.removed', async ({ payload }) => {
  payload.repositories_removed.map(repo => {
    db.remove(payload.installation.id, repo.id)
  })
})

webhooks.on('repository.created', async ({ payload }) => {
  repository(payload.installation, payload.repository)
})

webhooks.on('repository.deleted', async ({ payload }) => {
  db.remove(payload.installation.id, payload.repository.id)
})

webhooks.on('push', async ({ payload }) => {
  repository(payload.installation, payload.repository)
})

module.exports = webhooks.middleware
