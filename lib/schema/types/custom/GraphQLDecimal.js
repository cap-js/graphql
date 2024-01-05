const { GraphQLScalarType, Kind } = require('graphql')
const { getValueFromInputValueOrValueNode, getGraphQLValueError } = require('./util')

const ERROR_VARIABLE_NON_STRING_VALUE = 'Decimal variable value must be represented by a string'
const ERROR_NON_NUMERIC_VALUE = 'Decimal must be a numeric value'

const _validateIsDecimal = inputValueOrValueNode => {
  const value = getValueFromInputValueOrValueNode(inputValueOrValueNode)
  // Ignore rounding, only used to check if is finite valid number
  let number = Number(value)
  if (value.trim().length === 0 || isNaN(number) || !isFinite(number))
    throw getGraphQLValueError(ERROR_NON_NUMERIC_VALUE, inputValueOrValueNode)
}

const serialize = value => String(value)

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_VARIABLE_NON_STRING_VALUE, inputValue)

  _validateIsDecimal(inputValue)

  return inputValue
}

const parseLiteral = valueNode => {
  const { kind, value } = valueNode

  if (kind !== Kind.FLOAT && kind !== Kind.INT && kind !== Kind.STRING)
    throw getGraphQLValueError(ERROR_NON_NUMERIC_VALUE, valueNode)

  _validateIsDecimal(valueNode)

  return value
}

module.exports = new GraphQLScalarType({
  name: 'Decimal',
  description:
    'The `Decimal` scalar type represents exact signed decimal values. Decimal represents values as strings rather than floating point numbers.',
  serialize,
  parseValue,
  parseLiteral
})
