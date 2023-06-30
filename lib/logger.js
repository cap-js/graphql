const cds = require('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')
const util = require('util')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const queryLogger = (req, _, next) => {
  let query = req.body?.query || (req.query.query && decodeURIComponent(req.query.query))
  if (!query) {
    next()
    return
  }
  query = query.trim()

  const operationName = req.body?.operationName || req.query?.operationName

  let variables = !IS_PRODUCTION && (req.body?.variables || req.query?.variables)
  if (typeof variables === 'string') {
    try {
      // variables is a JSON string if taken from req.query.variables
      variables = JSON.parse(variables)
    } catch (e) {
      // Ignore parsing errors, handled by GraphQL server
    }
  }

  // Only add properties to object that aren't undefined
  const queryInfo = Object.fromEntries(Object.entries({ operationName, variables }).filter(([, v]) => v))
  // Only format queryInfo if it contains properties
  const formattedQueryInfo =
    Object.keys(queryInfo).length > 0 ? util.formatWithOptions({ depth: null }, queryInfo) : undefined

  // If query is multiline string, add padding
  let formattedQuery = query.includes('\n') ? `\n${query}` : query
  if (IS_PRODUCTION) formattedQuery = formattedQuery.replace(/\([\s\S]*?\)/g, '( *** )')

  // Don't log undefined values
  LOG.info(...[req.method, formattedQueryInfo, formattedQuery].filter(e => e))

  next()
}

module.exports = queryLogger
