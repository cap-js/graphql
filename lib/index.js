const { createHandler } = require('graphql-http/lib/use/express')

const { generateSchema4 } = require('./schema')

function GraphQLAdapter(services, options) {
  const schema = generateSchema4(services)
  return createHandler({ schema, ...options })
}

module.exports = GraphQLAdapter
