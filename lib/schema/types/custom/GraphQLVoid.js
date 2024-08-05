const { GraphQLScalarType } = require('graphql')

const serialize = () => ''

const parseValue = () => null

const parseLiteral = () => null

module.exports = new GraphQLScalarType({
  name: 'Void',
  description: 'Void',
  serialize,
  parseValue,
  parseLiteral
})
