const Octokit = require('@octokit/rest')
const passport = require('passport')
const Strategy = require('passport-github').Strategy

const pkg = require('../package.json')

const options = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.PROJECT_DOMAIN || `http://localhost:${process.env.PORT || 3000}/auth/callback`,
  userAgent: `${pkg.name}@${pkg.version}`
}

passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((user, cb) => cb(null, user))

passport.use(new Strategy(options, async (accessToken, refreshToken, user, cb) => {
  user.accessToken = accessToken

  // auth as user
  const github = new Octokit({
    auth: `token ${accessToken}`,
    previews: ['machine-man']
  })

  // fetch installations for this user
  const { data: { installations } } = await github.apps.listInstallationsForAuthenticatedUser()

  user.installations = installations

  cb(null, user)
}))

module.exports = passport
