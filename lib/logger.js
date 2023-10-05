const cds = require('@sap/cds')
const { decodeURIComponent } = cds.utils
const { IS_PRODUCTION } = require('./utils')
const util = require('util')
const LOG = cds.log('graphql')

const _isEmptyObject = o => Object.keys(o).length === 0

const queryLogger = (req, _, next) => {
  let query = req.body?.query || (req.query.query && decodeURIComponent(req.query.query))
  // Only log requests that contain a query
  if (!query) {
    next()
    return
  }
  query = query.trim()

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

  // If query is multiline string, add newline padding to front
  let formattedQuery = query.includes('\n') ? `\n${query}` : query
  // Sanitize all values between parentheses
  if (IS_PRODUCTION) formattedQuery = formattedQuery.replace(/\([\s\S]*?\)/g, '( *** )')

  // Don't log undefined values
  LOG.info(...[req.method, formattedQueryInfo, formattedQuery].filter(e => e))

  next()
}

module.exports = queryLogger
