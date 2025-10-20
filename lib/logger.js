const express = require('express')
const router = express.Router()
const cds = require('@sap/cds')
const { decodeURIComponent } = cds.utils
const { IS_PRODUCTION } = require('./utils')
const util = require('util')
const LOG = cds.log('graphql')
const { parse, visit, Kind, print } = require('graphql')

const _isEmptyObject = o => Object.keys(o).length === 0
class InvalidJSON extends Error {}
InvalidJSON.prototype.name = 'Invalid JSON body'
InvalidJSON.prototype.status = 400

router.use(function jsonBodyParser(req, res, next) {
  express.json({ ...cds.env.server.body_parser }) (req, res, function http_body_parser_next(err) {
    // Need to wrap, as CAP server deliberately crashes on SyntaxErrors
    if (err) return next(new InvalidJSON(err.message)
    next()
  })
})
      
router.use(function queryLogger(req, _, next) {
  let query = req.body?.query || (req.query.query && decodeURIComponent(req.query.query))
  // Only log requests that contain a query
  if (!query) {
    next()
    return
  }

  const operationName = req.body?.operationName || req.query?.operationName

  let variables = req.body?.variables || req.query?.variables
  if (typeof variables === 'string') {
    try {
      // variables is a JSON string if taken from req.query.variables
      variables = JSON.parse(variables)
    } catch (e) {
      // Ignore parsing errors, handled by GraphQL server
    }
  }
  if (IS_PRODUCTION && variables && !_isEmptyObject(variables)) variables = '***'

  // Only add properties to object that aren't undefined or empty
  const queryInfo = {
    ...(operationName && { operationName }),
    ...(variables && !_isEmptyObject(variables) && { variables })
  }
  // Only format queryInfo if it contains properties
  const formattedQueryInfo = _isEmptyObject(queryInfo)
    ? undefined
    : util.formatWithOptions({ colors: false, depth: null }, queryInfo)

  query = query.trim()

  if (IS_PRODUCTION) {
    try {
      const ast = parse(query)
      // Sanitize all arguments unless they are variables
      visit(ast, {
        [Kind.ARGUMENT](node) {
          if (node.value.kind === Kind.VARIABLE) return
          node.value = { kind: Kind.STRING, value: '***' }
        }
      })
      query = print(ast)
    } catch {
      // If parsing or sanitizing the query fails, log the original query
    }
  }

  // Don't log undefined values
  LOG.info(...[req.method, formattedQueryInfo, '\n', query].filter(e => e))

  next()
})

module.exports = router
