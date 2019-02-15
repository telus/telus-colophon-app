const db = require('../db')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function (installation, owner, name) {
  // installation auth
  const graphql = await client.installation(installation)

  // gimme content!
  const variables = { owner, name }
  let { repository } = await graphql(graph.repository, variables)

  // clean github data
  repository = graph.process(repository)

  log('%s:blue found colophon in %s:yellow/%s:yellow', installation, owner, name)

  return db.upsert(installation, repository)
}
