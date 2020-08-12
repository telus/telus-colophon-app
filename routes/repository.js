const parser = require('@telus/colophon-schema')
const db = require('../lib/db/')
const scan = require('../lib/scan/repo')

// capture error tree
const parseErrors = content => parser(content).catch(error => error.name === 'ColophonError' ? error.errors : error.message)

exports.index = async function getRepository(req, res) {
  const { org } = req.params
  const { name } = req.params

  let guest = true

  if (req.user) {
    const installations = req.user.installations.map(installation => installation.account.login)

    // validate this user is a member of this org
    if (installations.includes(org)) {
      guest = false
    }
  }

  const { rows: [repository] } = await db.repository.get(org, name)
  const { rows: [installation] } = await db.installation.get(org)

  if (!repository) {
    // guest mode?
    res.render(`repository/${guest ? 'public' : 'private'}/404`, { org, name, installation })
    return
  }

  // guest mode on a private repo?
  if (guest && repository.private) {
   res.render('repository/public/404', { org, name })
   return
  }

  // errors placeholder
  let errors

  // was this a valid colophon
  if (repository.content !== null && repository.colophon === null) {
    errors = await parseErrors(repository.content)
  }

   res.render(`repository/${guest ? 'public' : 'private'}/index`, { org, name, repository, errors })
}

exports.scan = async function dashboard(req, res) {
  const { org } = req.params
  const { name } = req.params

  const installations = req.user.installations.map(installation => installation.account.login)

  // validate this user is a member of this org
  if (!installations.includes(org)) {
   res.redirect('/dashboard')
   return
  }

  const { rows: [repository] } = await db.repository.get(org, name)

  // TODO check for existence

  scan(repository.installation, org, name)

  // TODO send to intermediary page

  res.redirect(`/${org}/${name}`)
}
