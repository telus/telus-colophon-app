require('./fixtures/env')

const client = require('../lib/github/api')
const nock = require('nock')

nock.disableNetConnect()

nock('https://api.github.com')
  .get('/users/foo/installation')
  .reply(200, 'path matched')

async function main () {
  const app = await client.app()
  const result = await app.apps.findUserInstallation({ username: 'foo' })

  console.log(result)
}

main()
