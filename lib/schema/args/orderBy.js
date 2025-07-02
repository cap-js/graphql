const { GraphQLList, GraphQLEnumType, GraphQLInputObjectType } = require('graphql')
const { gqlName } = require('../../utils')
const { hasScalarFields, shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')

module.exports = cache => {
  const generateOrderByForEntity = entity => {
    if (!hasScalarFields(entity)) return

    const orderByName = gqlName(entity.name) + '_orderBy'

    if (cache.has(orderByName)) return cache.get(orderByName)

    const fields = {}
    const orderByInputType = new GraphQLList(new GraphQLInputObjectType({ name: orderByName, fields: () => fields }))
    cache.set(orderByName, orderByInputType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = generateOrderByForElement(element)
      if (type) fields[gqlName(name)] = { type }
    }

    return orderByInputType
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

    if (cache.has(enumName)) return cache.get(enumName)

    const sortDirectionEnum = new GraphQLEnumType({
      name: enumName,
      values: { asc: { value: 'asc' }, desc: { value: 'desc' } }
    })
    cache.set(enumName, sortDirectionEnum)

    return sortDirectionEnum
  }

  return { generateOrderByForEntity, generateOrderByForElement }
}
