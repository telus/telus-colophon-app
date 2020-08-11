const logger = require('oh-my-log')

const options = {
  prefix: '%__name:blue  %__date:gray ›'
}

const info = logger('[colophon]', options)
const error = logger('[colophon]', Object.assign(options, {
  func: function consoleError(message) {
    throw new Error(message)
  }
}))

const exit = (err) => {
  error(err)
  process.exit(1)
}

module.exports = {
  info,
  error,
  exit
}
