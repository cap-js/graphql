const { graphqlHTTP } = require('express-graphql')

const { generateSchema4 } = require('./schema')
const { fieldResolver } = require('./resolvers')

function GraphQLAdapter(services, options) {
  const schema = generateSchema4(services)
  return graphqlHTTP({ fieldResolver, schema, ...options })
}

module.exports = GraphQLAdapter
