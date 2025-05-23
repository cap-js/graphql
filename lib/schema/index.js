const queryGenerator = require('./query')
const mutationGenerator = require('./mutation')
const subscriptionGenerator = require('./subscription')
const { GraphQLSchema } = require('graphql')
const { createRootResolvers, registerAliasFieldResolvers } = require('../resolvers')

function generateSchema4(services) {
  const resolvers = createRootResolvers(services)
  const cache = new Map()
  const query = queryGenerator(cache).generateQueryObjectType(services, resolvers.Query)
  const mutation = mutationGenerator(cache).generateMutationObjectType(services, resolvers.Mutation)
  const subscription = subscriptionGenerator(cache).generateSubscriptionObjectType(services, resolvers.Subscription)
  const schema = new GraphQLSchema({ query, mutation, subscription })
  registerAliasFieldResolvers(schema)
  return schema
}

module.exports = { generateSchema4 }
