const db = require('../db')
const client = require('../github/graphql')
const graph = require('../graph')
const log = require('../log')

module.exports = async function install (id, name, type) {
  // installation auth
  const graphql = await client.installation(id)

  // minor difference in user vs. org
  const query = type === 'User' ? graph.repositories.user : graph.repositories.org

  // gimme the edges!
  const variables = { login: name, endCursor: null }
  const repositories = []

  log('%s:blue scanning repositories in %s:magenta', id, name)

  // paginate through results
  for await (const response of client.iterator(graphql, query, variables)) {
    Array.prototype.push.apply(repositories, response.source.repositories.edges)
  }

  log('%s:blue found %d:cyan repositories in %s:magenta', id, repositories.length, name)

  // clean github data & process colophon content
  const data = repositories.map(({ node }) => graph.process(node))

  await Promise.all(data.map(repository => db.upsert(id, repository)))
}
