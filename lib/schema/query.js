const cds = require('@sap/cds/lib')
const { GraphQLObjectType } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const argsGenerator = require('./args')

module.exports = cache => {
  const generateQueryObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      if (!(service instanceof cds.ApplicationService)) continue

      const serviceName = gqlName(service.name)
      fields[serviceName] = {
        type: _serviceToObjectType(service),
        // REVISIT: Passed services currently don't directly contain doc property
        description: service.model.definitions[service.name].doc,
        resolve: resolvers[serviceName]
      }
    }

    return new GraphQLObjectType({ name: 'Query', fields })
  }

  const _isCompositionOfAspect = entity =>
    Object.values(entity.elements.up_?._target.elements ?? {}).some(
      e => e.targetAspect && e._target.name === entity.name
    )

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]

      if (_isCompositionOfAspect(entity)) continue

      fields[gqlName(key)] = {
        // REVISIT: requires differentiation for support of configurable schema flavors
        type: objectGenerator(cache).entityToObjectConnectionType(entity),
        // TODO: what should descriptions of connection fields look like?
        description: entity.doc,
        args: argsGenerator(cache).generateArgumentsForType(entity)
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
