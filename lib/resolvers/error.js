const cds = require('@sap/cds')
const LOG = cds.log()
const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['code', 'message', 'details']

const _sanitize = (key, value, out) => {
  if (IS_PRODUCTION) {
    if (ALLOWED_PROPERTIES_IN_PRODUCTION.includes(key)) out[key] = value
    return
  }

  if (key === 'stack') {
    out['stacktrace'] = value.split('\n')
    return
  }

  out[key] = value
}

const _reorderProperties = error => {
  let { code, message, details, stack } = error
  if (details) details = details.map(_reorderProperties)
  return { code, message, ...error, stack, details }
}

const _cdsToGraphQLError = (context, err) => {
  let { error } = normalizeError(err, context.req, _sanitize)

  // Ensure error properties are ordered nicely for the client
  error = _reorderProperties(error)

  const message = error.message
  const extensions = error

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const handleCDSError = (context, error) => {
  error = _ensureError(error)
  // TODO: choose log level depending on type of error analogous to OData adapter
  if (LOG._error) LOG.error(error)
  return _cdsToGraphQLError(context, error)
}

module.exports = { handleCDSError }
