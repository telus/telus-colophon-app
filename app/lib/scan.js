let files = [
  '.colophon.json',
  '.colophon.yaml',
  '.colophon.yml',
  '.colophonrc',
  'colophon.json',
  'colophon.yaml',
  'colophon.yml'
]

module.exports = async (github, owner, repo) => {
  for (const path of files) {
    const content = await github
      .repos
      .getContents({ owner, repo, path })
      .then(({ data }) => Buffer.from(data.content, 'base64').toString())
      // ignore 404 errors
      .catch(() => false)

    if (content) return { filename: path, content }
  }

  return false
}
