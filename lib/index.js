const express = require('express')
const path = require('path')
const { createHandler } = require('graphql-http/lib/use/express')

const { generateSchema4 } = require('./schema')

function GraphQLAdapter(services, options) {
  const router = express.Router()

  if (options.graphiql) {
    router.get('/', (req, res, next) => {
      if (req.query.query) {
        // Forward GET requests with query URL parameter to GraphQL server
        next()
      } else {
        res.sendFile(path.join(__dirname, '../app/graphiql.html'))
      }
    })
  }

  const schema = generateSchema4(services)
  router.use(createHandler({ schema, ...options }))

  return router
}

module.exports = GraphQLAdapter
