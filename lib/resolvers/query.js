const { executeRead } = require('./crud')

module.exports = async (context, service, entityOrFunction, field) => {
  // const response = {}

  const entity = entityOrFunction.kind === 'entity' && entityOrFunction
  const func = entityOrFunction.kind === 'function' && entityOrFunction

  if (func) {
    const name = func.name.replace(`${service.name}.`, '')
    return service[name]()
  }

  return executeRead(context, service, entity, field)

  // return response
}
