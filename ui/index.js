const cookies = require('cookie-parser')
const express = require('express')
const session = require('express-session')

const auth = require('./auth')
const dashboard = require('./dashboard')
const passport = require('../lib/passport')

const ui = express()

ui.set('view engine', 'pug')

ui.use(cookies())

// TODO use better secret
ui.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))

ui.use(passport.initialize())
ui.use(passport.session())
ui.use(express.static('public'))

module.exports = probot => {
  ui.use('/auth', auth)
  ui.use('/dashboard', dashboard(probot))
  ui.get('/', (req, res) => res.render('home'))

  return ui
}