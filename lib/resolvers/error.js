const cds = require('@sap/cds')
const LOG = cds.log()
const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['code', 'message', 'details']

const _sanitize = (k, v, o) => {
  if (IS_PRODUCTION) {
    if (ALLOWED_PROPERTIES_IN_PRODUCTION.includes(k)) o[k] = v
    return
  }

  if (k === 'stack') {
    o['stacktrace'] = v.split('\n')
    return
  }

  o[k] = v
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

module.exports = (context, error) => {
  error = _ensureError(error)
  if (LOG._error) LOG.error(error)
  return _cdsToGraphQLError(context, error)
}
