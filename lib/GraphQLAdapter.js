const express = require('express')
const { generateSchema4 } = require('./schema')
const path = require('path')
const cds = require('@sap/cds')
const LOG = cds.log('graphql')
const defaultErrorFormatter = require('./errorFormatter')
const queryLogger = require('./logger')
const graphiql = require('../app/graphiql')
const { createHandler: createRawHandler } = require('graphql-http')
const { formatError } = require('./resolvers/error')

const _createHandler = options => {
  const handle = createRawHandler(options)

  const handler = async (req, res) => {
    try {
      const [body, init] = await handle({
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        raw: req,
        context: { req, res }
      })
      res.writeHead(init.status, init.statusText, init.headers).end(body)
    } catch (e) {
      LOG.error('Internal error occurred during GraphQL request handling.', e)
    }
  }

  return handler
}

const _addReqResToContext = context => req => ({ ...({ req, res } = req.context), ...context })

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

  const context = _addReqResToContext({ errorFormatter })
  router.use(_createHandler({ schema, context, formatError, ...options }))

  return router
}

module.exports = GraphQLAdapter
