const { App } = require('@octokit/app')
const { graphql } = require('@octokit/graphql')

// TODO GH Enterprise: https://github.com/octokit/app.js#using-with-github-enterprise
// TODO Cache installation tokens outside of lru-cache https://github.com/octokit/app.js#caching-installation-tokens

// generate app identity jwt
const app = new App({ id: process.env.GITHUB_APP_ID, privateKey: process.env.GITHUB_PRIVATE_KEY })
const jwt = app.getSignedJsonWebToken()

// github client for app
exports.app = function getClient() {
  return graphql.defaults({ headers: { authorization: `Bearer ${jwt}` } })
}

// github client for installation
exports.installation = async function clientInstallation(installationId) {
  const token = await app.getInstallationAccessToken({ installationId })

  return graphql.defaults({ headers: { authorization: `token ${token}` } })
}

// github client for user
exports.user = async function clientUser(token) {
  return graphql.defaults({ headers: { authorization: `token ${token}` } })
}

exports.iterator = async function iterator(client, query, variables) {
  let hasNextPage = true
  let result = []
  const response = await client(query, variables)
  result.push(response)
  const { source: { repositories: { pageInfo } } } = response
  const variable = variables
  const { hasNextPage: infoNextPage, endCursor: infoEndCursor } = pageInfo
  hasNextPage = infoNextPage
  variable.endCursor = infoEndCursor
  if (hasNextPage) {
    result = result.concat(await iterator(client, query, variable))
  }
  return result
}