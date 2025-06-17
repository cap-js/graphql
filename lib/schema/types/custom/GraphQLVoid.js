const { GraphQLScalarType } = require('graphql')

const serialize = () => null

const parseValue = () => null

const parseLiteral = () => null

module.exports = new GraphQLScalarType({
  name: 'Void',
  description: 'The `Void` scalar type represents the absence of a value. Void can only represent the value `null`.',
  serialize,
  parseValue,
  parseLiteral
})
