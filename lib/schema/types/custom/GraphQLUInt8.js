const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, validateRange } = require('./util')

const ERROR_NON_INTEGER_VALUE = 'UInt8 cannot represent non integer value'
const ERROR_NON_8_BIT_UNSIGNED_INTEGER_VALUE = 'UInt8 must be an integer value between 0 and 2^8 - 1'

const MAX_UINT8 = 255 // 2^8 - 1
const MIN_UINT8 = 0 // 0

const parseValue = inputValue => {
  if (typeof inputValue !== 'number') throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, inputValue)

  validateRange(inputValue, MIN_UINT8, MAX_UINT8, ERROR_NON_8_BIT_UNSIGNED_INTEGER_VALUE)

  return inputValue
}

const parseLiteral = valueNode => {
  if (valueNode.kind !== Kind.INT) throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, valueNode)

  const num = parseInt(valueNode.value, 10)
  validateRange(num, MIN_UINT8, MAX_UINT8, ERROR_NON_8_BIT_UNSIGNED_INTEGER_VALUE, valueNode)

  return num
}

module.exports = new GraphQLScalarType({
  name: 'UInt8',
  description:
    'The `UInt8` scalar type represents 8-bit non-fractional unsigned whole numeric values. UInt8 can represent values between 0 and 2^8 - 1.',
  parseValue,
  parseLiteral
})
