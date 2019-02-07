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

module.exports = (github, { owner, repo }) => {
  // attempt to load all possible variations
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
