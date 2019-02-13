const db = require('../db')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function (installation, repo) {
  // installation auth
  const graphql = await client.installation(installation.id)

  // gimme content!
  const variables = { owner: installation.account.login, name: repo.name }
  const { repository } = await graphql(graph.repository, variables) // TODO Paginate

  // clean github data
  const data = graph.process([repository])

  log('found graph data!')

  return data.map(repository => db.upsert(installation.id, repository))
}
