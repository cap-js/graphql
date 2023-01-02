const { createHandler } = require('graphql-http/lib/use/express')

const { generateSchema4 } = require('./schema')
const { fieldResolver } = require('./resolvers')

function GraphQLAdapter(services, options) {
  const schema = generateSchema4(services)
  return createHandler({ schema, ...options })
}

module.exports = GraphQLAdapter
