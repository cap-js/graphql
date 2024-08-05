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
    if (returns && !returns._type) {
      if (returns.items) {
        const entity = service.model.definitions[returns.items.type]
        if (entity) return new GraphQLList(objectGenerator(cache).entityToObjectType(entity))
      } else {
        const entity = service.model.definitions[returns.type]
        if (entity) return objectGenerator(cache).entityToObjectType(entity)
      }
    } else {
      return cdsToGraphQLScalarType(returns)
    }
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
