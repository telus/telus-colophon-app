const express = require('express')

const passport = require('../lib/passport')

const auth = express.Router()

auth.get('/in', passport.authenticate('github'))
auth.get('/callback', passport.authenticate('github', { failureRedirect: '/home' }), (req, res) => res.redirect('/dashboard')) // TODO: failure redirect should go to an error page

auth.get('/out', (req, res) => {
  req.logout()
  res.redirect('/start')
})

module.exports = auth
