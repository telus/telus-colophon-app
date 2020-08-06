const db = require('../db/repository')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function add(installationID, owner, name) {
  // installation auth
  const graphql = await client.installation(installationID)

  // gimme content!
  const variables = { owner, name }
  let { repository } = await graphql(graph.repository, variables)

  log.info('%s:blue found colophon in %s:yellow/%s:yellow', installationID, owner, name)

  // clean github data
  repository = await graph.process(repository)

  return db.add(installationID, repository)
}
