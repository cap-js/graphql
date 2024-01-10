const {
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLInputObjectType
} = require('graphql')
const { gqlName } = require('../../utils')
const { hasScalarFields, shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')
const { RELATIONAL_OPERATORS, LOGICAL_OPERATORS, STRING_OPERATIONS, OPERATOR_LIST_SUPPORT } = require('../../constants')
const {
  GraphQLBinary,
  GraphQLDate,
  GraphQLDateTime,
  GraphQLInt16,
  GraphQLInt64,
  GraphQLDecimal,
  GraphQLTime,
  GraphQLTimestamp,
  GraphQLUInt8
} = require('../types/custom')

module.exports = cache => {
  const generateFilterForEntity = entity => {
    const filterName = gqlName(entity.name) + '_filter'

    const cachedFilterInputType = cache.get(filterName)
    if (cachedFilterInputType) return cachedFilterInputType
    if (!hasScalarFields(entity)) return

    const fields = {}
    const newFilterInputType = new GraphQLList(new GraphQLInputObjectType({ name: filterName, fields: () => fields }))
    cache.set(filterName, newFilterInputType)

    for (const name in entity.elements) {
      const element = entity.elements[name]
      const type = generateFilterForElement(element)
      if (type) fields[gqlName(name)] = { type }
    }

    return newFilterInputType
  }

  const generateFilterForElement = (element, followAssocOrComp) => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (followAssocOrComp && (element.isAssociation || element.isComposition)) {
      return gqlScalarType ? _generateScalarFilter(gqlScalarType) : generateFilterForEntity(element._target)
    } else if (gqlScalarType) {
      return _generateScalarFilter(gqlScalarType)
    }
  }

  const _generateScalarFilter = gqlType => {
    const numericOperators = Object.values({ ...RELATIONAL_OPERATORS, ...LOGICAL_OPERATORS })
    const filterType = {
      // REVISIT: which filters for binary
      [GraphQLBinary.name]: _generateFilterType(GraphQLBinary, [RELATIONAL_OPERATORS.eq, RELATIONAL_OPERATORS.ne]),
      [GraphQLBoolean.name]: _generateFilterType(GraphQLBoolean, [RELATIONAL_OPERATORS.eq, RELATIONAL_OPERATORS.ne]),
      [GraphQLDate.name]: _generateFilterType(GraphQLDate, numericOperators),
      [GraphQLDateTime.name]: _generateFilterType(GraphQLDateTime, numericOperators),
      [GraphQLDecimal.name]: _generateFilterType(GraphQLDecimal, numericOperators),
      // REVISIT: should 'eq'/'ne'/'in' be generated since exact comparisons could be difficult due to floating point errors?
      [GraphQLFloat.name]: _generateFilterType(GraphQLFloat, numericOperators),
      [GraphQLID.name]: _generateFilterType(GraphQLID, numericOperators),
      [GraphQLInt.name]: _generateFilterType(GraphQLInt, numericOperators),
      [GraphQLInt16.name]: _generateFilterType(GraphQLInt16, numericOperators),
      [GraphQLInt64.name]: _generateFilterType(GraphQLInt64, numericOperators),
      [GraphQLString.name]: _generateFilterType(
        GraphQLString,
        Object.values({ ...RELATIONAL_OPERATORS, ...LOGICAL_OPERATORS, ...STRING_OPERATIONS })
      ),
      [GraphQLTime.name]: _generateFilterType(GraphQLTime, numericOperators),
      [GraphQLTimestamp.name]: _generateFilterType(GraphQLTimestamp, numericOperators),
      [GraphQLUInt8.name]: _generateFilterType(GraphQLUInt8, numericOperators)
    }[gqlType.name]
    return new GraphQLList(filterType)
  }

  const _generateFilterType = (gqlType, operations) => {
    const filterName = gqlType.name + '_filter'

    const cachedFilterType = cache.get(filterName)
    if (cachedFilterType) return cachedFilterType

    const ops = operations.map(op => [[op], { type: OPERATOR_LIST_SUPPORT[op] ? new GraphQLList(gqlType) : gqlType }])
    const fields = Object.fromEntries(ops)
    const newFilterType = new GraphQLInputObjectType({ name: filterName, fields })
    cache.set(filterName, newFilterType)

    return newFilterType
  }

  return { generateFilterForEntity, generateFilterForElement }
}
