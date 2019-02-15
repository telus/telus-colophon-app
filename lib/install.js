const db = require('./db')
const scan = require('./scan/org')

module.exports = async function install (installation) {
  // add installation
  db.install(installation)
  // scan org
  scan(installation.id, installation.account.login, installation.account.type)
}
