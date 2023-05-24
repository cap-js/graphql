const cds = require('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')
const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')
const { generateSchema4 } = require('./lib/schema')
const graphiql = require('./app/graphiql')

function CDSGraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true }
  options = { ...defaults, ...options }

  router
    .use(express.json()) //> required by logger below
    .use((req, _, next) => {
      LOG.info(req.method, req.body?.query || decodeURIComponent(req.query.query))
      next()
    })

  if (options.graphiql) router.get('/', graphiql)
  const schema = generateSchema4(services)
  router.use((req, res) => createHandler({ schema, context: { req, res }, ...options })(req, res))
  return router
}

module.exports = CDSGraphQLAdapter
