const { GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql')
const { gqlName } = require('../../utils')
const argsGenerator = require('../args')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')
const { CONNECTION_FIELDS } = require('../../constants')

module.exports = cache => {
  const entityToObjectConnectionType = entity => {
    const name = gqlName(entity.name) + '_connection'

    const cachedEntityObjectConnectionType = cache.get(name)
    if (cachedEntityObjectConnectionType) return cachedEntityObjectConnectionType

    const fields = {}
    const newEntityObjectConnectionType = new GraphQLObjectType({ name, fields: () => fields })
    cache.set(name, newEntityObjectConnectionType)

    const objectType = entityToObjectType(entity)
    if (!objectType) {
      cache.delete(name)
      return
    }

    fields[CONNECTION_FIELDS.nodes] = { type: new GraphQLList(objectType) }
    fields[CONNECTION_FIELDS.totalCount] = { type: GraphQLInt }

    return newEntityObjectConnectionType
  }

  const entityToObjectType = entity => {
    const entityName = gqlName(entity.name)

    const cachedEntityObjectType = cache.get(entityName)
    if (cachedEntityObjectType) return cachedEntityObjectType

    const fields = {}
    const newEntityObjectType = new GraphQLObjectType({
      name: entityName,
      description: entity.doc,
      fields: () => fields
    })
    cache.set(entityName, newEntityObjectType)

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
      cache.delete(entityName)
      return
    }

    return newEntityObjectType
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
