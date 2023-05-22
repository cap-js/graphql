const { GraphQLObjectType } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const argsGenerator = require('./args')
const { isCompositionOfAspect } = require('./util')

module.exports = cache => {
  const generateQueryObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = gqlName(service.name)
      const resolve = resolvers[serviceName]
      fields[serviceName] = { type: _serviceToObjectType(service), resolve }
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

    return new GraphQLObjectType({ name: gqlName(service.name), fields })
  }

  return { generateQueryObjectType }
}
