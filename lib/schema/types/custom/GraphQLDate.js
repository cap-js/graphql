const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, parseDate } = require('./util')

const ERROR_NON_STRING_VALUE = 'Date cannot represent non string value'
const ERROR_NON_DATE_VALUE = 'Date values must be strings in the ISO 8601 format YYYY-MM-DD'

const _parseDate = inputValueOrValueNode => {
  const date = parseDate(inputValueOrValueNode, ERROR_NON_DATE_VALUE)
  // Only return YYYY-MM-DD
  return date.substring(0, date.indexOf('T'))
}

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_NON_STRING_VALUE, inputValue)

  return _parseDate(inputValue)
}

const parseLiteral = valueNode => {
  if (valueNode.kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_STRING_VALUE, valueNode)

  return _parseDate(valueNode)
}

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'The `Date` scalar type represents date values as strings in the ISO 8601 format `YYYY-MM-DD`.',
  parseValue,
  parseLiteral
})
