const express = require('express')
const path = require('path')
const { createHandler } = require('graphql-http/lib/use/express')

const { generateSchema4 } = require('./schema')

function GraphQLAdapter(services, options) {
  const router = express.Router()

  if (options.graphiql) {
    router.get('/', (_, res) => res.sendFile(path.join(__dirname, '../app/graphiql.html')))
  }

  const schema = generateSchema4(services)
  router.use((req, res) => createHandler({ schema, context: { req }, ...options })(req, res))

  return router
}

module.exports = GraphQLAdapter
