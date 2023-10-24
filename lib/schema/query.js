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

  const _entityToType = entity => {
    if (entity._isSingleton) return objectGenerator(cache).entityToObjectType(entity)

    return objectGenerator(cache).entityToObjectConnectionType(entity)
  }

  const _argsForEntity = entity => {
    if (entity._isSingleton) return

    return argsGenerator(cache).generateArgumentsForType(entity)
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]

      if (isCompositionOfAspect(entity)) continue

      // REVISIT: requires differentiation for support of configurable schema flavors
      const type = _entityToType(entity)
      const args = _argsForEntity(entity)

      fields[gqlName(key)] = { type, args }
    }

    return new GraphQLObjectType({ name: gqlName(service.name), fields })
  }

  return { generateQueryObjectType }
}
