const { GraphQLObjectType, GraphQLString } = require('graphql')
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
      const type = _serviceToObjectType(service)
      const resolve = resolvers[serviceName]
      if (type) fields[serviceName] = { type, resolve }
    }

    if (Object.keys(fields).length === 0) fields['dummy'] = { type: GraphQLString }

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

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({
      name: gqlName(service.name),
      // REVISIT: Passed services currently don't directly contain doc property
      description: service.model.definitions[service.name].doc,
      fields
    })
  }

  return { generateQueryObjectType }
}
