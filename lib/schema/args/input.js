const { GraphQLList, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = cache => {
  const entityToInputObjectType = (entity, isUpdate) => {
    const suffix = isUpdate ? '_U' : '_C'
    const entityName = gqlName(entity.name) + suffix

    const cachedEntityInputObjectType = cache.get(entityName)
    if (cachedEntityInputObjectType) return cachedEntityInputObjectType

    const fields = {}
    const newEntityInputObjectType = new GraphQLInputObjectType({ name: entityName, fields: () => fields })
    cache.set(entityName, newEntityInputObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = _elementToInputObjectType(element, isUpdate)
      if (type) fields[gqlName(name)] = { type }
    }

    // fields is empty if update input object is generated for an entity that only contains key elements
    if (Object.keys(fields).length === 0) return

    return newEntityInputObjectType
  }

  const _elementToInputObjectType = (element, isUpdate) => {
    if (shouldElementBeIgnored(element)) return

    // No keys in update input object
    if (isUpdate && element.key) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      // Input objects in deep updates overwrite previous entries with new entries and therefore always act as create input objects
      const type = gqlScalarType || entityToInputObjectType(element._target, false)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  return { entityToInputObjectType }
}
