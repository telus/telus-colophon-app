const db = require('../lib/db/')
const scan = require('../lib/scan/repo')

exports.index = async function repository (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows: [ repository ] } = await db.repository.get(org, name)
  const { rows: [ installation ] } = await db.installation.get(org)

  if (!repository) {
    // guest mode?
    return res.render(`repository/${req.user ? 'private' : 'public'}/404`, { org, name, installation })
  }

  // guest mode on a private repo?
  if (repository.private && !req.user) {
    return res.render(`repository/public/404`, { org, name })
  }

  return res.render(`repository/${req.user ? 'private' : 'public'}/index`, { org, name, repository })
}

exports.scan = async function (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows: [ repository ] } = await db.repository.get(org, name)

  // TODO check for existence

  scan(repository.installation, org, name)

  // TODO send to intermediary page

  res.redirect(`/${org}/${name}`)
}
