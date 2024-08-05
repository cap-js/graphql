const { cdsToGraphQLScalarType } = require('./scalar')
const objectGenerator = require('../types/object')
const { gqlName } = require('../../utils')
const { GraphQLList } = require('graphql')

module.exports = (cache, service) => {
  const operationToField = operation => {
    const { returns } = operation

    const type = _returnTypeToType(returns)
    if (!type) return

    const args = _paramsToArgs(operation.params)

    return { type, args }
  }

  const _returnTypeToType = returns => {
    if (!returns) return cdsToGraphQLScalarType()

    const isArrayed = returns.kind === 'type' && returns.items
    const returnType = isArrayed ? returns.items : returns
    const entity = service.model.definitions[returnType.type]

    let type
    if (entity) {
      type = objectGenerator(cache).entityToObjectType(entity)
    } else {
      const scalarType = cdsToGraphQLScalarType(returnType)
      if (scalarType) type = scalarType
    }

    if (!type) return

    if (isArrayed) return new GraphQLList(type)

    return type
  }

  const _paramsToArgs = params => {
    const args = {}

    for (const key in params) {
      const param = params[key]
      const type = cdsToGraphQLScalarType(param)
      args[gqlName(key)] = { type }
    }

    return args
  }

  return { operationToField }
}
