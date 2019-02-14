const db = require('../lib/db')
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
module.exports = async function dashboard (req, res) {
  if (req.user.installations.length === 0) {
    return res.render('dashboard/404')
  }

  const count = {}
  const { rows } = await db.count()

  // sort into count object and parse int
  rows.forEach(row => {
    const total = parseInt(row.total)
    const available = parseInt(row.available)

    count[row.installation] = { total, available }
  })

  res.render('dashboard/index', { count, installations: req.user.installations })
}
