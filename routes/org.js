const db = require('../lib/db')
const install = require('../lib/events/install')

exports.index = async function (req, res) {
  const org = req.params.org

  const { rows } = await db.list(org)

  if (rows.length === 0) {
    return res.render('org/404', { org })
  }

  res.render('org/index', { org, repositories: rows, total: rows[0] ? rows[0].total : 0 })
}

exports.refresh = async function (req, res) {
  const installation = await db.installation(req.org)
  install(installation)

  res.redirect('/dashboard')
}
