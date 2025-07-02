const cds = require('@sap/cds')
const LOG = cds.log('graphql')
const { GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql')
const { gqlName } = require('../../utils')
const argsGenerator = require('../args')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')
const { CONNECTION_FIELDS } = require('../../constants')

module.exports = cache => {
  const entityToObjectConnectionType = entity => {
    const name = gqlName(entity.name) + '_connection'

    if (cache.has(name)) return cache.get(name)

    const fields = {}
    const entityObjectConnectionType = new GraphQLObjectType({ name, fields: () => fields })
    cache.set(name, entityObjectConnectionType)

    const objectType = entityToObjectType(entity)
    if (!objectType) {
      cache.set(name)
      return
    }

    fields[CONNECTION_FIELDS.nodes] = { type: new GraphQLList(objectType) }
    fields[CONNECTION_FIELDS.totalCount] = { type: GraphQLInt }

    return entityObjectConnectionType
  }

  const entityToObjectType = entity => {
    const entityName = gqlName(entity.name)

    if (cache.has(entityName)) return cache.get(entityName)

    const fields = {}
    const entityObjectType = new GraphQLObjectType({
      name: entityName,
      description: entity.doc,
      fields: () => fields
    })
    cache.set(entityName, entityObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]

      // REVISIT: requires differentiation for support of configurable schema flavors
      const type = element.is2many ? _elementToObjectConnectionType(element) : _elementToObjectType(element)
      if (!type) continue

      const field = { type, description: element.doc }
      if (element.is2many) field.args = argsGenerator(cache).generateArgumentsForType(element)
      fields[gqlName(name)] = field
    }

    // fields is empty e.g. for empty aspects
    if (!Object.keys(fields).length) {
      LOG.warn(`Entity "${entity.name}" has no fields and has therefore been excluded from the schema.`)
      cache.set(entityName, undefined)
      return
    }

    return entityObjectType
  }

  const _elementToObjectType = element => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      const type = gqlScalarType || entityToObjectType(element._target)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  const _elementToObjectConnectionType = element => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element._type)
    return entityToObjectConnectionType(gqlScalarType || element._target)
  }

  return { entityToObjectConnectionType, entityToObjectType }
}
