const db = require('../lib/db')
const log = require('../lib/log')
const api = require('../lib/github/api')
const install = require('../lib/install')

const percentage = (x, y) => Math.floor((x / y) * 100)

// dashboard overview
exports.index = async function dashboard (req, res) {
  // only show installations belonging to the user
  const userInstallations = req.user.installations.map(installation => installation.id)

  let { rows } = await db.installations(userInstallations)

  if (rows.length === 0) {
    return res.render('dashboard/404')
  }

  const installations = rows.map(row => {
    row.available = row.available || 0
    row.total = row.total || 0

    row.progress = percentage(row.available, row.total)

    row.status = percentage > 0 ? percentage > 50 ? 'green' : 'yellow' : 'red'

    return row
  })

  res.render('dashboard/index', { installations })
}

exports.scan = async function dashboard (req, res) {
  const octokit = await api.app()

  // get all installations
  const { data } = await octokit.apps.listInstallations({ per_page: 100 }) // TODO: paginate

  log('found %d:cyan installations', data.length)

  // re-install
  data.map(install)

  res.redirect('/dashboard')
}
