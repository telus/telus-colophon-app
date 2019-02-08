let names = [
  '.colophon.json',
  '.colophon.yaml',
  '.colophon.yml',
  '.colophonrc',
  'colophon.json',
  'colophon.yaml',
  'colophon.yml'
]

// TODO: use regex to search for colophon file against all repo files

// getColophonPath = async(github, owner, repo) => {
//   return github
//     .listFiles({owner, repo, })
// }

getColophonContents = async (github, owner, repo) => {
  return Promise.all(names.map(name => {
    return github
      .repos
      .getContents({ owner, repo, path: name })

      .then(({ data }) => {
        const content = Buffer.from(data.content, 'base64').toString()
        return { name, content }
      })

      // ignore 404 errors
      .catch(() => ({ name }))
    }))

    // filter out empty results
    .then(entries => entries.filter(entry => entry.content))
}

getLastUpdatedDate = async (github, owner, repo, path) => {
  return github
    .repos
    .listCommits({owner, repo, path, per_page: 1})

    .then(({data}) => {
      return data[0].commit.committer.date
    })
}

module.exports = async (github, { owner, repo }) => {
  // attempt to load all possible variations
    let colophonContents = await getColophonContents(github, owner, repo)

    colophonContents[0].lastUpdated = await getLastUpdatedDate(github, owner, repo, colophonContents[0].name)

    return colophonContents
}
