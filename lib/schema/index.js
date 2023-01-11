const queryGenerator = require('./query')
const mutationGenerator = require('./mutation')
const { GraphQLSchema, printSchema } = require('graphql')
const { createRootResolvers, registerAliasFieldResolvers } = require('../resolvers')

class SchemaGenerator {
  generate(services) {
    const resolvers = createRootResolvers(services)
    const cache = new Map()
    const query = queryGenerator(cache).generateQueryObjectType(services, resolvers.Query)
    const mutation = mutationGenerator(cache).generateMutationObjectType(services, resolvers.Mutation)
    this._schema = new GraphQLSchema({ query, mutation })
    registerAliasFieldResolvers(this._schema)
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
  return new SchemaGenerator().generate(services).getSchema()
}

module.exports = { SchemaGenerator, generateSchema4 }
