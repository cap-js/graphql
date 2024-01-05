const { GraphQLScalarType, Kind, GraphQLError } = require('graphql')
const { getGraphQLValueError } = require('./util')

const ERROR_NON_STRING_VALUE = 'Binary cannot represent non string value'
const ERROR_NON_BASE64_OR_BASE64URL = 'Binary values must be base64 or base64url encoded and normalized strings'

const _normalizeBase64 = value => (Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64')).toString('base64')

const _validateBase64String = (value, buffer, valueNode) => {
  const base64Value = _toBase64(value)
  const normalized = _normalizeBase64(buffer)
  if (_stripPadding(base64Value) !== _stripPadding(normalized) || base64Value.length > normalized.length)
    throw new GraphQLError(ERROR_NON_BASE64_OR_BASE64URL, valueNode)
}

const _toBase64 = value => value.replace(/_/g, '/').replace(/-/g, '+')
const _toBase64Url = value => value.replace(/\//g, '_').replace(/\+/g, '-')
const _stripPadding = value => value.replace(/=/g, '')

const serialize = outputValue => _toBase64Url(_normalizeBase64(outputValue))

const parseValue = inputValue => {
  if (typeof inputValue !== 'string') throw getGraphQLValueError(ERROR_NON_STRING_VALUE, inputValue)

  const buffer = Buffer.from(inputValue, 'base64')
  _validateBase64String(inputValue, buffer)

  return buffer
}

const parseLiteral = valueNode => {
  const { kind, value } = valueNode

  if (kind !== Kind.STRING) throw getGraphQLValueError(ERROR_NON_STRING_VALUE, valueNode)

  // WORKAROUND: value could have already been parsed to a Buffer, necessary because of manual parsing in enrich AST
  if (Buffer.isBuffer(value)) return value

  const buffer = Buffer.from(value, 'base64')
  _validateBase64String(value, buffer, valueNode)

  return buffer
}

module.exports = new GraphQLScalarType({
  name: 'Binary',
  description: 'The `Binary` scalar type represents binary values as `base64url` encoded strings.',
  serialize,
  parseValue,
  parseLiteral
})
