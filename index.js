const GraphQLAdapter = require('./lib')
const cds = require ('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')
const express = require ('express')

let services

function CDSGraphQLAdapter (srv, options) {
  const defaults = { graphiql: true }
  options = { ...defaults, ...options }

  if (!services) {
    services = {}
    cds.on('served', ()=>{
      cds.app.use ('/graphql',
      cds.middlewares.before,
      express.Router()
        .use (express.json()) //> required by logger below
        .use ((req,_,next)=>{
          LOG.info (req.method, req.body?.query || decodeURIComponent(req.query.query))
          next()
        })
        .use (new GraphQLAdapter (services, options)),
      cds.middlewares.after)
    })
  }
  services[srv.path] = srv
 }

module.exports = CDSGraphQLAdapter
