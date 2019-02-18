const db = require('../lib/db/installation')
const log = require('../lib/log')
const api = require('../lib/github/api')
const install = require('../lib/install')

const percentage = (x, y) => Math.floor((x / y) * 100)

// dashboard overview
exports.index = async function dashboard (req, res) {
  // only show installations belonging to the user
  const userInstallations = req.user.installations.map(installation => installation.id)

  if (userInstallations.length === 0) {
    return res.render('dashboard/404')
  }

  let { rows } = await db.list(userInstallations)

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
  const octokit = await api.user(req.user.accessToken)

  // fetch installations for this user
  const { data: { installations } } = await octokit.apps.listInstallationsForAuthenticatedUser() // TODO paginate

  log('found %d:cyan installations', installations.length)

  // re-install user apps
  installations.map(install)

  res.redirect('/dashboard')
}
