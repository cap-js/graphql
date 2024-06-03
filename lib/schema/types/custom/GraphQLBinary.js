const { GraphQLScalarType, Kind } = require('graphql')
const { getGraphQLValueError } = require('./util')

const ERROR_NON_STRING_VALUE = 'Binary cannot represent non string value'

const _normalizeBase64 = value => (Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64')).toString('base64')

const _toBase64Url = value => value.replace(/\//g, '_').replace(/\+/g, '-')

const serialize = outputValue => _toBase64Url(_normalizeBase64(outputValue))

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_NON_STRING_VALUE, inputValue)

  return Buffer.from(inputValue, 'base64')
}

const parseLiteral = valueNode => {
  const { kind, value } = valueNode

  if (kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_STRING_VALUE, valueNode)

  // WORKAROUND: value could have already been parsed to a Buffer, necessary because of manual parsing in enrich AST
  if (Buffer.isBuffer(value)) return value

  return Buffer.from(value, 'base64')
}

module.exports = new GraphQLScalarType({
  name: 'Binary',
  description: 'The `Binary` scalar type represents binary values as `base64url` encoded strings.',
  serialize,
  parseValue,
  parseLiteral
})
