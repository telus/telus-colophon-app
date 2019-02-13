const db = require('../db')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function install (installation) {
  // installation auth
  const graphql = await client.installation(installation.id)

  // minor difference in user vs. org
  const query = installation.account.type === 'User' ? graph.repositories.user : graph.repositories.org

  // gimme the edges!
  const variables = { login: installation.account.login }
  const { source: { repositories } } = await graphql(query, variables) // TODO Paginate

  log('found %d repositories for installation: "%s"', repositories.edges.length, installation.account.login)

  // clean github data
  const clean = repositories.edges.map(({ node }) => node)
  const data = graph.process(clean)

  await Promise.all(data.map(repository => db.upsert(installation.id, repository)))
}
