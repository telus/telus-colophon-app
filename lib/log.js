const logger = require('oh-my-log')

const log = logger('[colophon]', {
  prefix: '%__name:blue  %__date:gray ›'
})

log.exit = (error) => {
  log(error)
  process.exit(1)
}

module.exports = log
