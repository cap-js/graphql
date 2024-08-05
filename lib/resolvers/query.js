const { executeRead } = require('./crud')
const astToParameters = require('./parse/ast2cqn/parameters')

module.exports = async (context, service, entityOrFunction, field) => {
  // const response = {}

  const entity = entityOrFunction.kind === 'entity' && entityOrFunction
  const func = entityOrFunction.kind === 'function' && entityOrFunction

  if (func) {
    const params = astToParameters(field.arguments)

    const name = func.name.replace(`${service.name}.`, '')
    const result = await service[name](params)

    const { returns } = func
    const isArrayed = returns.kind === 'type' && returns.items
    const returnType = isArrayed ? returns.items : returns

    const entity = service.model.definitions[returnType.type]
    if (entity) return formatResult(entity, field, result, false)

    return result
  }

  return executeRead(context, service, entity, field)

  // return response
}
