const cds = require('@sap/cds')
const LOG = cds.log('graphql')
const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')
const { generateSchema4 } = require('./lib/schema')
const graphiql = require('./app/graphiql')
const { decodeURIComponent } = cds.utils

function GraphQLAdapter(options) {
  const router = express.Router()
  const { services } = options
  const defaults = { graphiql: true }
  const schema = generateSchema4(services)
  options = { ...defaults, ...options }

  router
    .use(express.json()) //> required by logger below
    .use((req, _, next) => {
      LOG.info(req.method, req.body?.query || decodeURIComponent(req.query.query))
      next()
    })

  if (options.graphiql) router.get('/', graphiql)
  router.use((req, res) => createHandler({ schema, context: { req, res }, ...options })(req, res))
  return router
}

let services
module.exports = (srv, options) => {
  if (!services) {
    services = {}
    cds.on('served', () => {
      options.services = services
      cds.app.use (options.path, cds.middlewares.before, GraphQLAdapter(options), cds.middlewares.after)
    })
  }
  services[srv.name] = srv
}
