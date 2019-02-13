const parse = require('./parse')

const patterns = {
  dotjson: '.colophon.json',
  dotyaml: '.colophon.yaml',
  dotyml: '.colophon.yml',
  rc: '.colophonrc',
  json: 'colophon.json',
  yaml: 'colophon.yaml',
  yml: 'colophon.yml'
}

const variations = Object.entries(patterns).map(([key, filename]) => {
  return `${key}: object(expression: "HEAD:${filename}") {
    ... on Blob {
      content: text
    }
  }`
})

const fragments = {
  data: `fragment data on Repository {
    id
    full_name: nameWithOwner
    private: isPrivate
    ${variations}
  }`,

  connection: `fragment connection on RepositoryConnection {
    edges {
      node {
        ...data
      }
    }
  }`
}

exports.repository = `${fragments.data} query ($owner: String! $name: String!) {
  repository(owner: $owner, name: $name){
      ...data
    }
  }`

exports.repositories = {
  user: `${fragments.connection} ${fragments.data} query ($login: String!) {
    source: user(login: $login) {
      repositories(first: 100) {
        ...connection
      }
    }
  }`,

  org: `${fragments.connection} ${fragments.data} query ($login: String!) {
    source: organization(login: $login) {
      repositories(first: 100) {
        ...connection
      }
    }
  }`
}

// clean up graphql response
exports.process = repositories => {
  return repositories.map(repo => {
    const keys = Object.keys(patterns)

    for (const key of keys) {
      if (repo[key] && repo[key].content) {
        repo.filename = patterns[key]
        repo.content = repo[key].content

        // parse content
        repo.colophon = parse(repo)
      }

      // clean object
      delete repo[key]
    }

    return repo
  })
}
