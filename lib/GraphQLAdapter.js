const express = require('express')
const { generateSchema4 } = require('./schema')
const path = require('path')
const cds = require('@sap/cds')
const defaultErrorFormatter = require('./errorFormatter')
const queryLogger = require('./logger')
const graphiql = require('../app/graphiql')
const { formatError } = require('./resolvers/error')
const createHandler = require('./handler')

function GraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true }
  const schema = generateSchema4(services)
  options = { ...defaults, ...options }

  const errorFormatter = options.errorFormatter
    ? require(path.join(cds.root, options.errorFormatter))
    : defaultErrorFormatter

  router
    .use(express.json()) //> required by logger below
    .use(queryLogger)

  if (options.graphiql) router.use(graphiql)

  const context = { ...(options.context || {}), errorFormatter }
  router.use(createHandler({ schema, formatError, ...options, context }))

  return router
}

module.exports = GraphQLAdapter
