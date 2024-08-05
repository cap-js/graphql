const astToEntries = require('./entries')

const astToParameters = args => {
  const params = {}
  for (const arg of args) {
    params[arg.name.value] = astToEntries(arg)
  }
  return params
}

module.exports = astToParameters
