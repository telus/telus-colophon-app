const passport = require('passport')
const Strategy = require('passport-github').Strategy

const pkg = require('../package.json')

const options = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/callback', // TODO: host url should be dynamic?
  userAgent: `${pkg.name}@${pkg.version}`
}

passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((user, cb) => cb(null, user))

passport.use(new Strategy(options, (accessToken, refreshToken, user, cb) => {
  user.accessToken = accessToken
  cb(null, user)
}))

module.exports = passport
