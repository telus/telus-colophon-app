const routes = require('./routes/')
const db = require('./lib/db')
const graph = require('./lib/graph')

async function initInstall (probot, installation) {
  // installation auth
  const github = await probot.auth(installation.id)

  // minor difference in user vs. org
  const query = installation.account.type === 'User' ? graph.repositories.user : graph.repositories.org

  // gimme the edges!
  const variables = { login: installation.account.login }
  const { source: { repositories } } = await github.query(query, variables) // TODO Paginate

  probot.log.info('found %d repositories for installation: "%s"', repositories.edges.length, installation.account.login)

  // clean github data
  const clean = repositories.edges.map(({ node }) => node)
  const data = graph.process(clean)

  await Promise.all(data.map(repository => db.upsert(installation.id, repository)))
}

async function initRepo (probot, installation, repo) {
  // installation auth
  const github = await probot.auth(installation.id)

  // gimme content!
  const variables = { owner: installation.account.login, name: repo.name }
  const { repository } = await github.query(graph.repository, variables) // TODO Paginate

  // clean github data
  const data = graph.process([repository])

  return data.map(repository => db.upsert(installation.id, repository))
}

module.exports = async probot => {
  // assign ui routes
  const route = probot.route()
  route.get('/', (req, res, next) => res.redirect('/home'))
  route.use(routes)

  // app auth
  const github = await probot.auth()

  probot.log.info('initializing app')

  // get all installations
  const { data } = await github.apps.listInstallations({ per_page: 100 }) // TODO: paginate

  probot.log.info('found %d installations', data.length)

  // rebuild entire database
  data.forEach(installation => initInstall(probot, installation))

  // installation added
  probot.on('installation.created', async context => {
    initInstall(probot, context.payload.installation)
  })

  // installation removed
  probot.on('installation.deleted', async context => {
    db.uninstall(context.payload.installation.id)
  })

  // installation updated (repose added)
  probot.on('installation_repositories.added', context => {
    context.payload.repositories_added.map(repo => {
      initRepo(probot, context.payload.installation, repo)
    })
  })

  // installation updated (repos removed)
  probot.on('installation_repositories.removed', async context => {
    context.payload.repositories_removed.map(repo => {
      db.remove(context.payload.installation.id, repo.id)
    })
  })

  probot.on('repository.created', async context => {
    initRepo(probot, context.payload.installation, context.payload.repository)
  })
  probot.on('repository.deleted', async context => {
    db.remove(context.payload.installation.id, context.payload.repository.id)
  })

  probot.on('push', async context => {
    initRepo(probot, context.payload.installation, context.payload.repository)
  })
}
