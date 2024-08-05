const { GraphQLObjectType } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const argsGenerator = require('./args')
const { isCompositionOfAspect } = require('./util')
const { cdsToGraphQLScalarType } = require('./types/scalar')

module.exports = cache => {
  const generateQueryObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = gqlName(service.name)
      fields[serviceName] = {
        type: _serviceToObjectType(service),
        resolve: resolvers[serviceName]
      }
    }

    return new GraphQLObjectType({ name: 'Query', fields })
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]

      if (isCompositionOfAspect(entity)) continue

      // REVISIT: requires differentiation for support of configurable schema flavors
      const type = objectGenerator(cache).entityToObjectConnectionType(entity)
      const args = argsGenerator(cache).generateArgumentsForType(entity)

      fields[gqlName(key)] = { type, args }
    }

    const { operations } = service

    if (operations) {
      for (const key in operations) {
        const operation = operations[key]
        const func = operation.kind === 'function' && operation
        if (!func) continue

        // Ignore non-scalar return types for now
        if (!func.returns._type) break

        const gqlScalarType = cdsToGraphQLScalarType(func.returns)
        const type = gqlScalarType

        fields[gqlName(key)] = { type }
      }
    }

    return new GraphQLObjectType({
      name: gqlName(service.name),
      // REVISIT: Passed services currently don't directly contain doc property
      description: service.model.definitions[service.name].doc,
      fields
    })
  }

  return { generateQueryObjectType }
}
