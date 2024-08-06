const astToParameters = require('./parse/ast2cqn/parameters')
const GraphQLRequest = require('./GraphQLRequest')
const formatResult = require('./parse/ast/result')

module.exports = async ({ req, res }, service, operation, field) => {
  const params = astToParameters(field.arguments)

  const event = operation.name.replace(`${service.definition.name}.`, '')
  const result = await service.dispatch(new GraphQLRequest({ req, res, /*query,*/ event, data: params, /*params*/ }))

  const { returns } = operation
  const isArrayed = returns.kind === 'type' && returns.items
  const returnType = isArrayed ? returns.items : returns

  const entity = service.model.definitions[returnType.type]
  if (entity) return formatResult(entity, field, result, isArrayed, false)

  return result
}
