const parser = require('@telus/colophon-schema')
const log = require('../lib/log')

const fragments = {
  data: `
    fragment data on Repository {
      id
      url
      full_name: nameWithOwner
      private: isPrivate
      language: primaryLanguage {
        name
      }
      yaml: object(expression: "HEAD:.colophon.yml") {
        ... on Blob {
          content: text
        }
      }
      committedDate: object(expression: "master") {
        ... on Commit {
          blame(path: ".colophon.yml") {
            ranges {
              commit {
                committedDate
              }
            }
          }
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
exports.process = async repository => {
  if (!repository.yaml) return repository
  const updatedRepository = { ...repository }
  // capture the content
  updatedRepository.content = repository.yaml.content

  // attempt to parse content
  try {
    updatedRepository.colophon = await parser(repository.yaml.content)
    updatedRepository.updated = repository.committedDate.blame.ranges[0].commit.committedDate
  } catch (err) {
    // silently fail
    log.info('invalid colophon file found in %s:yellow', repository.full_name)
  }

  return updatedRepository
}
