const cds = require('@sap/cds')
const LOG = cds.log()
const localeFrom = require('@sap/cds/lib/req/locale')
const { getErrorMessage } = require('@sap/cds/libx/_runtime/common/error/utils')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['code', 'message', 'details']

const _getStackObj = error => ({ ...(!IS_PRODUCTION && { stacktrace: error.stack?.split('\n') }) })

const _sanitize = error => {
  if (IS_PRODUCTION)
    Object.keys(error).forEach(key => !ALLOWED_PROPERTIES_IN_PRODUCTION.includes(key) && delete error[key])
  return error
}

const _prepareError = (error, locale) => {
  const code = error.code || error.message
  const message = getErrorMessage(error, locale)
  const details = error.details?.map(detail => _prepareError(detail, locale))
  // Only add outer stacktrace if multiple errors are present, otherwise its meaningless
  const stackObj = details ? {} : _getStackObj(error)
  // Duplicate properties to ensure code and message come first, but aren't overwritten by properties from error object
  return _sanitize({ code, message, ...error, code, message, ...stackObj, details })
}

const _cdsToGraphQLError = (context, error) => {
  const locale = localeFrom(context.req)

  const sanitizedError = _prepareError(error, locale)
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
