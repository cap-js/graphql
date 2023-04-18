const cds = require ('@sap/cds')
const { decodeURIComponent } = cds.utils
const LOG = cds.log('graphql')

const requestLogger = (req, _, next) => {
  let query = req.body?.query || (req.query.query && decodeURIComponent(req.query.query))
  if (!query) {
    next()
    return
  }
  query = query.trim()

  const { operationName } = req.body
  const { variables } = process.env.NODE_ENV !== 'production' && req.body
  // Only add properties to object that aren't undefined
  const queryInfo = Object.fromEntries(Object.entries({ operationName, variables }).filter(([, v]) => v))
  // If query is multiline string, add padding
  const formattedQuery = query.includes('\n') ? `\n${query}\n` : query

  // Don't log undefined values or empty objects
  LOG.info(...[req.method, queryInfo, formattedQuery].filter(e => e && Object.keys(e).length > 0))

  next()
}

module.exports = requestLogger