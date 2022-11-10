const { GraphQLList, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = cache => {
  const entityToInputObjectType = (entity, suffix) => {
    const entityName = gqlName(entity.name) + suffix

    const cachedEntityInputObjectType = cache.get(entityName)
    if (cachedEntityInputObjectType) return cachedEntityInputObjectType

    const fields = {}
    const newEntityInputObjectType = new GraphQLInputObjectType({ name: entityName, fields: () => fields })
    cache.set(entityName, newEntityInputObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = _elementToInputObjectType(element, suffix)
      if (type) fields[gqlName(name)] = { type }
    }

    return newEntityInputObjectType
  }

  const _elementToInputObjectType = (element, suffix) => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      const type = gqlScalarType || entityToInputObjectType(element._target, suffix)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  return { entityToInputObjectType }
}
