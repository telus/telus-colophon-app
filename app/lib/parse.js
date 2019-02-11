const yaml = require('js-yaml')

module.exports = ({ filename, content }) => {
  let colophon

  switch (filename.slice(-2)) {
    case 'rc':
    case 'on':
      try {
        colophon = JSON.parse(content)
      } catch (err) { }
      break

    case 'ml':
      try {
        colophon = yaml.safeLoad(content)
      } catch (err) { }
      break
  }

  return colophon
}
