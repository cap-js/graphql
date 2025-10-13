const queryGenerator = require('./query')
const mutationGenerator = require('./mutation')
const { GraphQLSchema, validateSchema } = require('graphql')
const { createRootResolvers, registerAliasFieldResolvers } = require('../resolvers')

function generateSchema4(services) {
  const resolvers = createRootResolvers(services)
  const cache = new Map()

  const query = queryGenerator(cache).generateQueryObjectType(services, resolvers.Query)
  const mutation = mutationGenerator(cache).generateMutationObjectType(services, resolvers.Mutation)
  const schema = new GraphQLSchema({ query, mutation })

  registerAliasFieldResolvers(schema)

  const schemaValidationErrors = validateSchema(schema)
  if (schemaValidationErrors.length) {
    schemaValidationErrors.forEach(error => (error.severity = 'Error')) // Needed for cds-dk to decide logging based on log level
    throw new AggregateError(schemaValidationErrors, 'GraphQL schema validation failed')
  }

  return schema
}

module.exports = { generateSchema4 }
