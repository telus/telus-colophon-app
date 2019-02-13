const db = require('../lib/db')

module.exports = async function repository (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows } = await db.get(org, name)

  if (rows.length === 0) {
    return res.render('repository/404', { org, name })
  }

  // keep view logic clean
  res.render('repository/index', { org, name, repository: rows.shift() })
}
