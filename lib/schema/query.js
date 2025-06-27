const cds = require('@sap/cds')
const LOG = cds.log('graphql')
const { GraphQLObjectType } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const argsGenerator = require('./args')
const { isCompositionOfAspect } = require('./util')
const { GraphQLVoid } = require('./types/custom')

module.exports = cache => {
  const generateQueryObjectType = (services, resolvers) => {
    const name = 'Query'
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = gqlName(service.name)
      const type = _serviceToObjectType(service)
      if (!type) continue
      fields[serviceName] = { type, resolve: resolvers[serviceName] }
    }

    // Empty root query object type is not allowed, so we add a placeholder field
    if (!Object.keys(fields).length) {
      fields._ = { type: GraphQLVoid }
      LOG.warn(
        `Root query object type "${name}" is empty. A placeholder field has been added to ensure a valid schema.`
      )
    }

    return new GraphQLObjectType({ name, fields })
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]

      if (isCompositionOfAspect(entity)) continue

      // REVISIT: requires differentiation for support of configurable schema flavors
      const type = objectGenerator(cache).entityToObjectConnectionType(entity)
      if (!type) continue
      const args = argsGenerator(cache).generateArgumentsForType(entity)

      fields[gqlName(key)] = { type, args }
    }

    if (!Object.keys(fields).length) {
      LOG.warn(`Service "${service.name}" has no fields and has therefore been excluded from the schema.`)
      return
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
