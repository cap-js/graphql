const express = require('express')
const { generateSchema4 } = require('./schema')
const path = require('path')
const cds = require('@sap/cds')
const defaultErrorFormatter = require('./errorFormatter')
const queryLogger = require('./logger')
const graphiql = require('../app/graphiql')
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
    : defaultErrorFormatter

  const bodyParserOptions = {}
  const { max_content_length } = options
  if (max_content_length) bodyParserOptions.limit = max_content_length

  router
    .use(express.json(bodyParserOptions)) //> required by logger below
    .use(queryLogger)

  if (options.graphiql) router.use(graphiql)

  router.use((req, res) =>
    createHandler({ schema, context: { req, res, errorFormatter }, formatError, ...options })(req, res)
  )

  return router
}

module.exports = GraphQLAdapter
