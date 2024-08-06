const { executeRead } = require('./crud')
const executeFunction = require('./operation')

module.exports = async (context, service, entityOrFunction, field) => {
  const entity = entityOrFunction.kind === 'entity' && entityOrFunction
  const func = entityOrFunction.kind === 'function' && entityOrFunction

  if (func) return executeFunction(context, service, func, field)

  return executeRead(context, service, entity, field)
}
