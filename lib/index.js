const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')

const { generateSchema4 } = require('./schema')
const graphiql = require('../app/graphiql')

function GraphQLAdapter(services, options) {
  const router = express.Router()

  if (options.graphiql) router.get('/', graphiql)

  const schema = generateSchema4(services)
  router.use((req, res) => createHandler({ schema, context: { req, res }, ...options })(req, res))

  return router
}

module.exports = GraphQLAdapter
