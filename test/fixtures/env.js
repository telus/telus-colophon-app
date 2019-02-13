const { readFileSync } = require('fs')
const { join } = require('path')

// dummy data for github auth
process.env.GITHUB_APP_ID = 123456
process.env.GITHUB_PRIVATE_KEY = readFileSync(join(__dirname, 'key.pem'), 'utf8')
