const { GraphQLScalarType, Kind } = require('graphql')
const { getValueFromInputValueOrValueNode, getGraphQLValueError, validateRange } = require('./util')

const ERROR_VARIABLE_NON_STRING_VALUE = 'Int64 variable value must be represented by a string'
const ERROR_NON_INTEGER_VALUE = 'Int64 cannot represent non integer value'
const ERROR_NON_64_BIT_INTEGER_VALUE = 'Int64 must be an integer value between -(2^63) and 2^63 - 1'

const MAX_INT64 = BigInt('9223372036854775807') // 2^63 - 1
const MIN_INT64 = BigInt('-9223372036854775808') // (-2^63)

const _toBigInt = inputValueOrValueNode => {
  const value = getValueFromInputValueOrValueNode(inputValueOrValueNode)
  if (value.trim().length === 0) throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, inputValueOrValueNode)
  try {
    return BigInt(value)
  } catch (error) {
    throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, inputValueOrValueNode)
  }
}

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_VARIABLE_NON_STRING_VALUE, inputValue)

  const num = _toBigInt(inputValue)
  validateRange(num, MIN_INT64, MAX_INT64, ERROR_NON_64_BIT_INTEGER_VALUE)

  return num.toString()
}

const parseLiteral = valueNode => {
  const { kind } = valueNode

  if (kind !== Kind.INT && kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, valueNode)

  const num = _toBigInt(valueNode)
  validateRange(num, MIN_INT64, MAX_INT64, ERROR_NON_64_BIT_INTEGER_VALUE, valueNode)

  return num.toString()
}

module.exports = new GraphQLScalarType({
  name: 'Int64',
  description:
    'The `Int64` scalar type represents 64-bit non-fractional signed whole numeric values. Int64 can represent values between -(2^63) and 2^63 - 1.',
  parseValue,
  parseLiteral
})
