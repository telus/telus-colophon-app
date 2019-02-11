const routes = require('./routes/')
const db = require('./lib/db')
const scan = require('./lib/scan')
const parse = require('./lib/parse')

async function add (repository) {
  const [ owner, repo ] = repository.full_name.split('/')

  // search for colophon files
  const result = await scan(this.github, owner, repo)

  // get colophon data
  const data = result ? parse(result) : false

  await db.upsert(this.payload.installation.id, repository, data)
}

module.exports = probot => {
  // assign ui routes
  const route = probot.route()
  route.get('/', (req, res, next) => res.redirect('/home'))
  route.use(routes)

  // installation added
  probot.on('installation.created', async context => {
    await Promise.all(context.payload.repositories.map(add, context))
  })

  // installation removed
  probot.on('installation.deleted', async context => db.uninstall(context.payload.installation.id))

  // installation updated (repose added)
  probot.on('installation_repositories.added', async context => {
    await Promise.all(context.payload.repositories_added.map(repo => db.upsert(context.payload.installation.id, repo)))
  })

  // installation updated (repos removed)
  probot.on('installation_repositories.removed', async context => {
    context.payload.repositories_removed.map(repo => db.remove(context.payload.installation.id, repo.id))
  })

  probot.on('repository.created', async context => {
    context.log.info(context.payload)
  })
  probot.on('repository.deleted', async context => {
    context.log.info(context.payload)
  })
  probot.on('repository.archived', async context => {
    context.log.info(context.payload)
  })
  probot.on('repository.unarchived', async context => {
    context.log.info(context.payload)
  })

  probot.on('push', async context => {
    context.log.info(context)
  })
}
