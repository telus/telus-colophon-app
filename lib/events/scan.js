const db = require('../db')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function (installation, repo) {
  // installation auth
  const graphql = await client.installation(installation.id)

  // gimme content!
  const variables = { owner: repo.owner.login, name: repo.name }
  let { repository } = await graphql(graph.repository, variables)

  // clean github data
  repository = graph.process(repository)

  log('%s:blue found colophon in %s:yellow', installation.id, repo.full_name)

  return db.upsert(installation.id, repository)
}
