const GraphQLAdapter = require('./lib')
const cds = require ('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')
const express = require ('express')

function CDSGraphQLAdapter (options) {
  const { services } = options
  const defaults = { graphiql: true }
  options = { ...defaults, ...options }

  return express.Router()
  .use (express.json()) //> required by logger below
  .use ((req,_,next)=>{
    LOG.info (req.method, req.body?.query || decodeURIComponent(req.query.query))
    next()
  })
  .use (new GraphQLAdapter (services, options))
}

let services
module.exports = (srv, options) => {
  if (!services) {
    services = {}
    cds.on('served', () => {
      options.services = services
      cds.app.use (options.endpoint, cds.middlewares.before, CDSGraphQLAdapter(options), cds.middlewares.after)
    })
  }
  services[srv.name] = srv
}
