const cds = require('@sap/cds')
const LOG = cds.log()
const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['code', 'message', 'details']

const _getStackObj = error => ({ ...(!IS_PRODUCTION && { stacktrace: error.stack?.split('\n') }) })

const _sanitize = error => {
  if (IS_PRODUCTION)
    Object.keys(error).forEach(key => !ALLOWED_PROPERTIES_IN_PRODUCTION.includes(key) && delete error[key])
  return error
}

const _prepareError = error => {
  const { code, message } = error
  const details = error.details?.map(detail => _prepareError(detail))
  // Only add outer stacktrace if multiple errors are present, otherwise its meaningless
  const stackObj = details ? {} : _getStackObj(error)
  // Duplicate properties to ensure code and message come first, but aren't overwritten by properties from error object
  return _sanitize({ code, message, ...error, code, message, ...stackObj, details })
}

const _cdsToGraphQLError = (context, error) => {
  error = normalizeError(error, context.req, false).error

  const sanitizedError = _prepareError(error)
  const message = sanitizedError.message
  const extensions = sanitizedError

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = (context, error) => {
  error = _ensureError(error)
  if (LOG._error) LOG.error(error)
  return _cdsToGraphQLError(context, error)
}
