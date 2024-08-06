const astToParameters = require('./parse/ast2cqn/parameters')
const formatResult = require('./parse/ast/result')

module.exports = async (service, operation, field) => {
  const params = astToParameters(field.arguments)

  const name = operation.name.replace(`${service.name}.`, '')
  const result = await service[name](params)

  const { returns } = operation
  const isArrayed = returns.kind === 'type' && returns.items
  const returnType = isArrayed ? returns.items : returns

  const entity = service.model.definitions[returnType.type]
  if (entity) return formatResult(entity, field, result, isArrayed, false)

  return result
}
