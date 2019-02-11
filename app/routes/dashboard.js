const { ensureLoggedIn } = require('connect-ensure-login')
const express = require('express')

const db = require('../lib/db')

const dash = express.Router()

const loggedIn = ensureLoggedIn('/auth/in')

  // only show relevant content to the logged-in user
function locals (req, res, next) {
    // assign user object to view
  res.locals.user = req.user._json
  res.locals.installations = req.user.installations

  if (req.params.org) {
    res.locals.installation = res.locals.installations.find(installation => installation.account.login === req.params.org)
  }

  next()
}

async function dashboard (req, res) {
  if (res.locals.installations.length === 0) {
    return res.render('dashboard/404')
  }

  const { rows } = await db.count()

  const count = {}

  // sort into count object and parse int
  rows.forEach(row => (count[row.installation] = { total: parseInt(row.total), available: parseInt(row.available) }))

  res.render('dashboard/index', { count })
}

async function org (req, res) {
  const org = req.params.org

  const { rows } = await db.list(org)

  if (rows.length === 0) {
    return res.render('org/404', { org })
  }

  res.render('org/index', { org, repositories: rows })
}

async function repository (req, res) {
  const org = req.params.org
  const name = req.params.name

  const { rows } = await db.get(org, name)

  if (rows.length === 0) {
    return res.render('repository/404', { org, name })
  }

  // keep view logic clean
  res.render('repository/index', { org, name, repository: rows.shift() })
}

dash.get('/dashboard', loggedIn, locals, dashboard)
dash.get('/:org/:name', loggedIn, locals, repository)
dash.get('/:org', loggedIn, locals, org)

module.exports = dash
