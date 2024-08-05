const { cdsToGraphQLScalarType } = require('./scalar')
const objectGenerator = require('../types/object')
const { gqlName } = require('../../utils')
const { GraphQLList } = require('graphql')

module.exports = (cache, service) => {
  const operationToField = operation => {
    const { returns } = operation

    let type
    if (returns && !returns._type) {
      if (returns.items) {
        const entity = service.model.definitions[returns.items.type]
        if (entity) type = new GraphQLList(objectGenerator(cache).entityToObjectType(entity))
      } else {
        const entity = service.model.definitions[returns.type]
        if (entity) type = objectGenerator(cache).entityToObjectType(entity)
      }
    } else {
      type = cdsToGraphQLScalarType(returns)
    }

    if (!type) return

    const args = {}

    for (const key in operation.params) {
      const param = operation.params[key]
      const type = cdsToGraphQLScalarType(param)
      args[gqlName(key)] = { type }
    }

    return { type, args }
  }

  return { operationToField }
}
