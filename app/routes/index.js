const { join } = require('path')
const bodyParser = require('body-parser')
const cookies = require('cookie-parser')
const express = require('express')
const session = require('express-session')

// import routes
const auth = require('./auth')
const dashboard = require('./dashboard')

// test
const db = require('../lib/db')

// import libs
const passport = require('../lib/passport')

// initiate new express instance
const app = express()

// configure app variables
app.set('view engine', 'pug')
app.set('views', join(__dirname, '..', 'views'))

// assign middlewares
app.use(cookies())

// setup sessions
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }))

// assign passport middileware
app.use(passport.initialize())
app.use(passport.session())

// assign body parser
app.use(bodyParser.json())

// assign static path
app.use(express.static('public'))

// export app after passing 'probot' to routes
module.exports = probot => {
  app.use('/auth', auth)
  app.use('/dashboard', dashboard(probot))
  app.get('/foo', async (req, res) => {
    const data = await db.repos()

    res.status(200).json(data)
  })

  return app
}
