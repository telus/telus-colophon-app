#!/usr/bin/env node

// load env variables FIRST
require('./lib/env')

const yargs = require('yargs')

const app = require('./app')
const db = require('./lib/db')
const log = require('./lib/log')

async function main (argv) {
  // attempt database connection first
  try {
    await db.connect()
  } catch (error) {
    log('Database connection failed')
    process.exit(1)
  }

  app.listen(process.env.COLOPHON_PORT || 3000, () => {
    log('listening on port %s:yellow', process.env.COLOPHON_PORT || 3000)
  })
}

yargs // eslint-disable-line no-unused-expressions
  .usage('$0 [args]')
  .command('$0', 'start colophon server', () => {}, main)
  .help()
  .argv
