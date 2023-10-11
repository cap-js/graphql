const cds = require('@sap/cds')
require('./api').registerCompileTargets(cds.compile.to)
const express = require('express')
const { generateSchema4 } = require('./schema')
const queryLogger = require('./logger')
const graphiql = require('../app/graphiql')
const { createHandler } = require('graphql-http/lib/use/express')
const { formatError } = require('./resolvers/error')

function GraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true, errorFormatter: './errorFormatter' }
  const schema = generateSchema4(services)
  options = { ...defaults, ...options }

  const errorFormatter = require(options.errorFormatter)

  router
    .use(express.json()) //> required by logger below
    .use(queryLogger)

  if (options.graphiql) router.use(graphiql)

  router.use((req, res) =>
    createHandler({ schema, context: { req, res, errorFormatter }, formatError, ...options })(req, res)
  )

  return router
}

module.exports = GraphQLAdapter
