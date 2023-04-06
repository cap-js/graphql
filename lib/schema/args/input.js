const { GraphQLList, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = (cache, isUpdate) => {
  const suffix = isUpdate ? '_U' : '_C'

  const entityToInputObjectType = (entity) => {
    const entityName = gqlName(entity.name) + suffix

    const cachedEntityInputObjectType = cache.get(entityName)
    if (cachedEntityInputObjectType) return cachedEntityInputObjectType

    const fields = {}
    const newEntityInputObjectType = new GraphQLInputObjectType({ name: entityName, fields: () => fields })
    cache.set(entityName, newEntityInputObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = _elementToInputObjectType(element)
      if (type) fields[gqlName(name)] = { type }
    }

    return newEntityInputObjectType
  }

  const _elementToInputObjectType = (element) => {
    if (shouldElementBeIgnored(element)) return
    // TODO: handle empty update input objects for entities that only contain keys
    // No keys in update input object
    if (isUpdate && element.key) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      // TODO: allow keys to be specified in nested update input objects -> should nested type be _C input object?
      const type = gqlScalarType || entityToInputObjectType(element._target)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  return { entityToInputObjectType }
}
