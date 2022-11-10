const { GraphQLList, GraphQLEnumType, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { hasScalarFields, shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = cache => {
  const generateOrderByForEntity = entity => {
    const orderByName = gqlName(entity.name) + '_orderBy'

    const cachedOrderByInputType = cache.get(orderByName)
    if (cachedOrderByInputType) return cachedOrderByInputType
    if (!hasScalarFields(entity)) return

    const fields = {}
    const newOrderByInputType = new GraphQLList(new GraphQLInputObjectType({ name: orderByName, fields: () => fields }))
    cache.set(orderByName, newOrderByInputType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = generateOrderByForElement(element)
      if (type) fields[gqlName(name)] = { type }
    }

    return newOrderByInputType
  }

  const generateOrderByForElement = (element, followAssocOrComp) => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (followAssocOrComp && (element.isAssociation || element.isComposition)) {
      return gqlScalarType ? _generateSortDirectionEnum() : generateOrderByForEntity(element._target)
    } else if (gqlScalarType) {
      return _generateSortDirectionEnum()
    }
  }

  const _generateSortDirectionEnum = () => {
    const enumName = 'SortDirection'

    const cachedSortDirectionEnum = cache.get(enumName)
    if (cachedSortDirectionEnum) return cachedSortDirectionEnum

    const newSortDirectionEnum = new GraphQLEnumType({
      name: enumName,
      values: { asc: { value: 'asc' }, desc: { value: 'desc' } }
    })
    cache.set(enumName, newSortDirectionEnum)

    return newSortDirectionEnum
  }

  return { generateOrderByForEntity, generateOrderByForElement }
}
