const db = require('../lib/db')
const install = require('../lib/events/install')

exports.index = async function (req, res) {
  const org = req.params.org
  const page = parseInt(req.query.page - 1 || 0)

  const limit = 10

  const { rows } = await db.list(org, limit, page * limit)

  if (rows.length === 0) {
    return res.render('org/404', { org })
  }

  const total = rows[0] ? rows[0].total : 0
  const pages = Math.ceil(total / limit)

  res.render('org/index', { org, repositories: rows, total, pages, page: page + 1 })
}

exports.scan = async function (req, res) {
  const { rows: [ installation ] } = await db.installation(req.params.org)

  // TODO check for existence

  install(installation.id, installation.name, installation.type)

  // TODO add intermediary page

  res.redirect(`/${req.params.org}`)
}
