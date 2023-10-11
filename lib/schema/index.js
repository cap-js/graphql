const queryGenerator = require('./query')
const mutationGenerator = require('./mutation')
const { GraphQLSchema } = require('graphql')
const { createRootResolvers, registerAliasFieldResolvers } = require('../resolvers')
const { printSchema } = require('graphql')

// REVISIT: remove class with cds^8
class SchemaGenerator {
  generate(services) {
    this._schema = generateSchema4(services)
    return this
  }

  getSchema() {
    return this._schema
  }

  printSchema() {
    return printSchema(this._schema)
  }
}

function generateSchema4(services) {
  const resolvers = createRootResolvers(services)
  const cache = new Map()
  const query = queryGenerator(cache).generateQueryObjectType(services, resolvers.Query)
  const mutation = mutationGenerator(cache).generateMutationObjectType(services, resolvers.Mutation)
  const schema = new GraphQLSchema({ query, mutation })
  registerAliasFieldResolvers(schema)
  return schema
}

module.exports = { SchemaGenerator, generateSchema4 }
