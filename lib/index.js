const { graphqlHTTP } = require('express-graphql')

const { generateSchema4 } = require('./schema')

function GraphQLAdapter(services, options) {
  const schema = generateSchema4(services)
  return graphqlHTTP({ schema, ...options })
}

module.exports = GraphQLAdapter
