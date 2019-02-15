const db = require('../lib/db')
const scan = require('../lib/events/scan')

exports.index = async function repository (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows: [ repository ] } = await db.get(org, name)

  if (!repository) {
    return res.render('repository/404', { org, name })
  }

  // keep view logic clean
  res.render('repository/index', { org, name, repository })
}

exports.scan = async function (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows: [ repository ] } = await db.get(org, name)

  // TODO check for existence

  scan(repository.installation, org, name)

  // TODO send to intermediary page

  res.redirect(`/${org}/${name}`)
}
