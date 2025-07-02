const { GraphQLList, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = cache => {
  const entityToInputObjectType = (entity, isUpdate) => {
    const suffix = isUpdate ? '_U' : '_C'
    const entityName = gqlName(entity.name) + suffix

    if (cache.has(entityName)) return cache.get(entityName)

    const fields = {}
    const entityInputObjectType = new GraphQLInputObjectType({ name: entityName, fields: () => fields })
    cache.set(entityName, entityInputObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = _elementToInputObjectType(element, isUpdate)
      if (type) fields[gqlName(name)] = { type }
    }

    // fields is empty if update input object is generated for an entity that only contains key elements
    if (!Object.keys(fields).length) {
      cache.set(entityName)
      return
    }

    return entityInputObjectType
  }

  const _elementToInputObjectType = (element, isUpdate) => {
    if (shouldElementBeIgnored(element)) return

    // No keys in update input object
    if (isUpdate && element.key) return

    // TODO: @mandatory -> GraphQLNonNull
    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      // Input objects in deep updates overwrite previous entries with new entries and therefore always act as create input objects
      const type = gqlScalarType || entityToInputObjectType(element._target, false)
      if (type) return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  return { entityToInputObjectType }
}
