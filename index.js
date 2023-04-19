const GraphQLAdapter = require('./lib')
const express = require ('express')
const queryLogger = require('./lib/logger')

function CDSGraphQLAdapter (options) {
  const {services} = options
  const defaults = { graphiql: true }
  options = { ...defaults, ...options }

  return express.Router()
  .use (express.json()) //> required by logger below
  .use (queryLogger)
  .use (new GraphQLAdapter (services, options))
}

module.exports = CDSGraphQLAdapter
