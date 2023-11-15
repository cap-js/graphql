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
  // This function creates the GraphQL context of a request, that is passed to resolvers, by
  // merging the GraphQL context that has been created by GraphQLAdapter, which contains e.g.
  // errorFormatter, with the request context, which contains req and res of the current request.
  const context = req => ({ ...options.context, ...req.context  })

  const handle = createRawHandler({ ...options, context })

  const handler = async (req, res) => {
    const { url, method, headers, body } = req
    const raw = req
    // Request context, not graphql context
    const context = { req, res }
    try {
      const [resBody, init] = await handle({ url, method, headers, body, raw, context })
      res.writeHead(init.status, init.statusText, init.headers).end(resBody)
    } catch (e) {
      LOG.error('Internal error occurred during GraphQL request handling.', e)
    }
  }

  return handler
}

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

  const context = { errorFormatter }
  router.use(_createHandler({ schema, context, formatError, ...options }))

  return router
}

module.exports = GraphQLAdapter
