const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, parseDate } = require('./util')

const ERROR_NON_STRING_VALUE = 'DateTime cannot represent non string value'
const ERROR_NON_DATE_TIME_VALUE = 'DateTime values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ssTZD'

const _parseDate = inputValueOrValueNode => {
  const date = parseDate(inputValueOrValueNode, ERROR_NON_DATE_TIME_VALUE)
  // Cut off milliseconds
  return date.slice(0, 19) + 'Z'
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
  name: 'DateTime',
  description:
    'The `DateTime` scalar type represents datetime values as strings in the ISO 8601 format `YYYY-MM-DDThh-mm-ssTZD`.',
  parseValue,
  parseLiteral
})
