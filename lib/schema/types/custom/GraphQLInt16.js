const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError, validateRange } = require('./util')

const ERROR_NON_INTEGER_VALUE = 'Int16 cannot represent non integer value'
const ERROR_NON_16_BIT_INTEGER_VALUE = 'Int16 must be an integer value between -(2^15) and 2^15 - 1'

const MAX_INT16 = 32767 // 2^15 - 1
const MIN_INT16 = -32768 // (-2^15)

const parseValue = inputValue => {
  if (typeof inputValue !== 'number') throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, inputValue)

  validateRange(inputValue, MIN_INT16, MAX_INT16, ERROR_NON_16_BIT_INTEGER_VALUE)

  return inputValue
}

const parseLiteral = valueNode => {
  if (valueNode.kind !== Kind.INT) throw getGraphQLValueError(ERROR_NON_INTEGER_VALUE, valueNode)

  const num = parseInt(valueNode.value, 10)
  validateRange(num, MIN_INT16, MAX_INT16, ERROR_NON_16_BIT_INTEGER_VALUE, valueNode)

  return num
}

module.exports = new GraphQLScalarType({
  name: 'Int16',
  description:
    'The `Int16` scalar type represents 16-bit non-fractional signed whole numeric values. Int16 can represent values between -(2^15) and 2^15 - 1.',
  parseValue,
  parseLiteral
})
