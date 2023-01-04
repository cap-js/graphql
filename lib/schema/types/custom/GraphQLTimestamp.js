const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, parseDate } = require('./util')

const ERROR_NON_STRING_VALUE = 'Timestamp cannot represent non string value'
const ERROR_NON_TIMESTAMP_VALUE =
  'Timestamp values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ss.sTZD with up to 7 digits of fractional seconds'

const _validateTimestamp = inputValueOrValueNode => {
  // Only use for validation, not for parsing, to avoid cutting off milliseconds precision with more than 3 decimal places
  parseDate(inputValueOrValueNode, ERROR_NON_TIMESTAMP_VALUE)
}

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_NON_STRING_VALUE, inputValue)

  _validateTimestamp(inputValue)

  return inputValue
}

const parseLiteral = valueNode => {
  if (valueNode.kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_STRING_VALUE, valueNode)

  _validateTimestamp(valueNode)

  return valueNode.value
}

module.exports = new GraphQLScalarType({
  name: 'Timestamp',
  description:
    'The `Timestamp` scalar type represents timestamp values as strings in the ISO 8601 format `YYYY-MM-DDThh-mm-ss.sTZD` with up to 7 digits of fractional seconds.',
  parseValue,
  parseLiteral
})
