const client = require('../lib/github/api')
const passport = require('passport')
const Strategy = require('passport-github').Strategy

const pkg = require('../package.json')

const baseUrl = process.env.COLOPHON_LINK || `http://localhost:${process.env.COLOPHON_PORT || 3000}`

const options = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${baseUrl}/auth/callback`,
  userAgent: `${pkg.name}@${pkg.version}`
}

passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((user, cb) => cb(null, user))

// TODO handle expired code on /auth/callback
passport.use(new Strategy(options, async (accessToken, refreshToken, user, cb) => {
  // construct new user object to be used in sessions
  const session = user._json

  session.accessToken = accessToken

  // auth as user
  const api = await client.user(accessToken)

  // fetch installations for this user
  const { data: { installations } } = await api.apps.listInstallationsForAuthenticatedUser() // TODO paginate

  session.installations = installations

  cb(null, session)
}))

module.exports = passport
