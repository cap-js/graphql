const { executeRead } = require('./crud')
const astToParameters = require('./parse/ast2cqn/parameters')

module.exports = async (context, service, entityOrFunction, field) => {
  // const response = {}

  const entity = entityOrFunction.kind === 'entity' && entityOrFunction
  const func = entityOrFunction.kind === 'function' && entityOrFunction

  if (func) {
    const name = func.name.replace(`${service.name}.`, '')
    const params = astToParameters(field.arguments)
    return service[name](params)
  }

  return executeRead(context, service, entity, field)

  // return response
}
