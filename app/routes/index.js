const { join } = require('path')
const bodyParser = require('body-parser')
const cookies = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const day = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')

// import routes
const auth = require('./auth')
const dashboard = require('./dashboard')

// import libs
const passport = require('../lib/passport')

// initiate new express instance
const app = express()

// view helpers
day.extend(relativeTime)
app.locals.day = day

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
app.use(bodyParser.json({limit: '50mb'}))

// assign static path
// TODO: this is hacky way of loading assets
app.use(/.*\/assets/, express.static(join(__dirname, '..', 'node_modules/tabler-ui/dist/assets')))
app.use(express.static('public'))

// export app after passing 'probot' to routes
app.use('/auth', auth)
app.use('/home', (req, res) => res.render('home'))
app.use('/start', (req, res) => res.render('start'))
app.use(dashboard)

module.exports = app
