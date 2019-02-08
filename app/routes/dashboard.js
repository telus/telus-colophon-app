const { ensureLoggedIn } = require('connect-ensure-login')
const express = require('express')
const Octokit = require('@octokit/rest')

const scan = require('../lib/scan')
const parse = require('../lib/parse')

const dash = express.Router()

const per_page = 100

module.exports = probot => {
  dash.use(ensureLoggedIn('/auth/in')) // TODO: clean urls later

  // only show relevant content to the logged-in user
  dash.use(async (req, res, next) => {
    res.locals.foo = 'bar'
    res.locals.user = req.user
    res.locals.nav = {
      avatar: {},
      breadcrumbs: []
    }

    // auth as user
    const user = new Octokit({
      auth: `token ${req.user.accessToken}`,
      previews: ['machine-man']
    })

    const { data: { installations } } = await user.apps.listInstallationsForAuthenticatedUser()

    res.locals.installations = installations

    next()
  })

  dash.get('/', (req, res) => {
    res.render('dashboard/index')
  })

  // global locals manager
  dash.get('/:installation/:owner?/:repo?', (req, res, next) => {
    const id = parseInt(req.params.installation, 10)

    const installation = res.locals.installations.find(installation => installation.id === id)

    res.locals.nav.breadcrumbs.push(installation.account.login)
    res.locals.nav.avatar = {
      image: installation.account.avatar_url,
      link: installation.account.html_url
    }

    if (req.params.owner && req.params.repo) {
      res.locals.nav.breadcrumbs.push(req.params.repo)
      res.locals.nav.avatar.link = `https://github.com/${req.params.owner}/${req.params.repo}`
    }

    next()
  })

  dash.get('/:installation', async (req, res) => {
    const installation_id = parseInt(req.params.installation, 10)

    const github = await probot.auth(installation_id)

    const { data: { repositories } } = await github.apps.listRepos({ per_page: 100 }) // TODO paginate

    res.render('dashboard/installation', { installation_id, repositories })
  })

  dash.get('/:installation/:owner/:repo', async (req, res) => {
    const installation_id = parseInt(req.params.installation, 10)

    const github = await probot.auth(installation_id)

    let entries = await scan(github, req.params)

    const data = parse(entries)

    res.render('dashboard/repository', { entries, data })
  })

  return dash
}
