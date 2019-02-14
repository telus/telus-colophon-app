const db = require('../lib/db')

module.exports = async function org (req, res) {
  const org = req.params.org

  const { rows } = await db.list(org)

  if (rows.length === 0) {
    return res.render('org/404', { org })
  }

  res.render('org/index', { org, repositories: rows, total: rows[0] ? rows[0].total : 0 })
}
