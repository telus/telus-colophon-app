const yaml = require('js-yaml')

const fragments = {
  data: `
    fragment data on Repository {
      id
      full_name: nameWithOwner
      private: isPrivate
      url
      yaml: object(expression: "HEAD:.colophon.yml") {
        ... on Blob {
          content: text
        }
      }
    }`,

  connection: `
    fragment connection on RepositoryConnection {
      edges {
        node {
          ...data
        }
      }
    }`
}

exports.repository = `
  ${fragments.data} query ($owner: String! $name: String!) {
    repository(owner: $owner, name: $name) {
      ...data
    }
  }`

exports.repositories = {
  user: `
    ${fragments.connection} ${fragments.data} query ($login: String! $endCursor: String) {
      source: user(login: $login) {
        repositories(first: 100 after: $endCursor) {
          ...connection
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`,

  org: `
    ${fragments.connection} ${fragments.data} query ($login: String! $endCursor: String) {
      source: organization(login: $login) {
        repositories(first: 100 after: $endCursor) {
          ...connection
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`
}

// clean up graphql response
exports.process = repository => {
  if (!repository.yaml) return repository

  // capture the content
  repository.content = repository.yaml.content

  // attempt to parse content
  try {
    repository.colophon = yaml.safeLoad(repository.yaml.content)
  } catch (err) {
    // silently fail
    // TODO: track failed syntax
  }

  return repository
}
