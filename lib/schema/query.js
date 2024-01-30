const { GraphQLObjectType } = require('graphql')
const { toGQLName } = require('../utils')
const objectGenerator = require('./types/object')
const argsGenerator = require('./args')
const { isCompositionOfAspect } = require('./util')

module.exports = cache => {
  const generateQueryObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = toGQLName(service.name)
      const type = _serviceToObjectType(service)
      const resolve = resolvers[serviceName]
      fields[serviceName] = { type, resolve }
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

      fields[toGQLName(key)] = { type, args }
    }

    const name = toGQLName(service.name)
    // REVISIT: Passed services currently don't directly contain doc property
    const description = service.model.definitions[service.name].doc
    return new GraphQLObjectType({ name, description, fields })
  }

  return { generateQueryObjectType }
}
