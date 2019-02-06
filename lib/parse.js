const yaml = require('js-yaml')

module.exports = entries => {
  let name
  let content
  let colophon

  // attempt to parse found files
  entries.forEach(entry => {
    if (!entry.content) return

    switch (entry.name.slice(-2)) {
      case 'rc':
      case 'on':
        try {
          name = entry.name
          content = entry.content
          colophon = JSON.parse(entry.content)
        } catch (err) { }
        break

      case 'ml':
        try {
          name = entry.name
          content = entry.content
          colophon = yaml.safeLoad(entry.content)
        } catch (err) { }
        break
    }
  })

  return { name, content, colophon }
}
