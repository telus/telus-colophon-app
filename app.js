const { ensureLoggedIn } = require('connect-ensure-login')
const { join } = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const day = require('dayjs')
const express = require('express')
const relativeTime = require('dayjs/plugin/relativeTime')
const session = require('express-session')
const SessionStorage = require('connect-pg-simple')(session)

// import local dependencies
const { pool } = require('./lib/db')
const auth = require('./routes/auth')
const dashboard = require('./routes/dashboard')
const log = require('./lib/log')
const org = require('./routes/org')
const passport = require('./lib/passport')
const repository = require('./routes/repository')
const webhooks = require('./routes/webhooks')

// initiate new express instance
const app = express()

// view helpers
day.extend(relativeTime)
app.locals.day = day

// configure app variables
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'views'))

// assign common middlewares
// TODO add further performance middlewares
app.use(cookieParser())
app.use(bodyParser.json({ limit: '2mb' }))

// setup sessions
// TODO optimize session management
app.use(session({
  store: new SessionStorage({ pool }),
  secret: process.env.COLOPHON_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day
  secure: new URL(process.env.COLOPHON_LINK).protocol === 'https:'
}))

// assign passport middleware
app.use(passport.initialize())
app.use(passport.session())

// custom express logging
app.use((req, res, next) => {
  // queue the log to send as soon as the response is finished
  res.on('finish', () => log('%s:blue %s:gray %s:green', req.method, req.originalUrl, res.statusCode))
  next()
})

// assign static path
app.use(express.static('static'))

// assign user object to view
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

const checkLogin = (req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.redirect('/start')
  }
}

// assign routes
app.use('/auth', auth)
app.use('/home', (req, res) => res.render('home'))
app.use('/start', (req, res) => res.render('start'))
app.use('/dashboard', checkLogin, dashboard)
app.use('/:org/:name', repository)
app.use('/:org', org)

// listen to webhooks
app.post('/', webhooks)

// // app auth
// const github = await probot.auth()

// probot.log.info('initializing app')

// // get all installations
// const { data } = await github.apps.listInstallations({ per_page: 100 }) // TODO: paginate

// probot.log.info('found %d installations', data.length)

// // rebuild entire database
// data.forEach(installation => initInstall(probot, installation))

module.exports = app
