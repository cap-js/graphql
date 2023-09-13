const express = require('express')
const { generateSchema4 } = require('./schema')
const queryLogger = require('./logger')
const graphiql = require('../app/graphiql')
const { createHandler } = require('graphql-http/lib/use/express')

function GraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true }
  const schema = generateSchema4(services)
  options = { ...defaults, ...options }

  router
    .use(express.json()) //> required by logger below
    .use(queryLogger)

  if (options.graphiql) router.use(graphiql)

  router.use((req, res) => createHandler({ schema, context: { req, res }, ...options })(req, res))

  return router
}

module.exports = GraphQLAdapter
