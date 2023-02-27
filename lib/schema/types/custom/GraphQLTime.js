const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, getValueFromInputValueOrValueNode, ISO_TIME_REGEX } = require('./util')

const ERROR_NON_STRING_VALUE = 'Time cannot represent non string value'
const ERROR_NON_TIME_VALUE = 'Time values must be strings in the ISO 8601 format hh:mm:ss'

const _validateTime = inputValueOrValueNode => {
  const value = getValueFromInputValueOrValueNode(inputValueOrValueNode)
  if (!ISO_TIME_REGEX.test(value)) throw getGraphQLValueError(ERROR_NON_TIME_VALUE, inputValueOrValueNode)
}

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_NON_STRING_VALUE, inputValue)

  _validateTime(inputValue)

  return inputValue
}

const parseLiteral = valueNode => {
  if (valueNode.kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_STRING_VALUE, valueNode)

  _validateTime(valueNode)

  return valueNode.value
}

module.exports = new GraphQLScalarType({
  name: 'Time',
  description: 'The `Time` scalar type represents time values as strings in the ISO 8601 format `hh:mm:ss`.',
  parseValue,
  parseLiteral
})
