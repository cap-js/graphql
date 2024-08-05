const astToParameters = arguments => {
  const params = {}
  for (const arg of arguments) {
    params[arg.name.value] = arg.value.value
  }
  return params
}

module.exports = astToParameters
