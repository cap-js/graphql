const GraphQLAdapter = require('./lib')
const cds = require ('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')
const express = require ('express')

function CDSGraphQLAdapter (options) {
  const {services} = options
  const defaults = { graphiql: true }
  options = { ...defaults, ...options }

  return express.Router()
  .use (express.json()) //> required by logger below
  .use ((req,_,next)=>{
    const query = req.body?.query || req.query.query && decodeURIComponent(req.query.query)
    if (!query) {
      next()
      return
    }

    const formattedQuery = query.includes('\n') && !query.startsWith('\n') ? '\n' + query + '\n' : query
    const operationName = req.body?.operationName && { operationName: req.body.operationName }
    const variables = process.env.NODE_ENV !== 'production' && req.body?.variables && { variables: req.body.variables }

    LOG.info (...[req.method, operationName, formattedQuery, variables].filter(e => e))

    next()
  })
  .use (new GraphQLAdapter (services, options))
}

module.exports = CDSGraphQLAdapter
