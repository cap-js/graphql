const express = require('express')
const { generateSchema4 } = require('./schema')
const path = require('path')
const cds = require('@sap/cds')
const queryLogger = require('./logger')
const { createHandler } = require('graphql-http/lib/use/express')
const { formatError } = require('./resolvers/error')

function GraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true }
  const schema = generateSchema4(services)
  options = { ...defaults, ...options }

  const errorFormatter = options.errorFormatter
    ? require(path.join(cds.root, options.errorFormatter))
    : require('./errorFormatter') // default error formatter

  router
    .use(express.json({ ...cds.env.server.body_parser })) //> required by logger below
    .use(queryLogger)

  if (options.graphiql) router.use(require('../app/graphiql'))

  router.use((req, res) =>
    createHandler({ schema, context: { req, res, errorFormatter }, formatError, ...options })(req, res)
  )

  return router
}

module.exports = GraphQLAdapter
