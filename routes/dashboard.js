const db = require('../lib/db')
const log = require('../lib/log')
const api = require('../lib/github/api')
const install = require('../lib/install')

// // only show relevant content to the logged-in user
// dash.use((req, res, next) => {
//   // assign user object to view
//   res.locals.user = req.user._json
//   res.locals.installations = req.user.installations

//   if (req.params.org) {
//     res.locals.installation = res.locals.installations.find(installation => {
//       return installation.account.login === req.params.org
//     })
//   }

//   next()
// })

// dashboard overview
exports.index = async function dashboard (req, res) {
  // only show installations belonging to the user
  const installations = req.user.installations.map(installation => installation.id)

  const { rows } = await db.installations(installations)

  if (rows.length === 0) {
    return res.render('dashboard/404')
  }

  res.render('dashboard/index', { installations: rows })
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
