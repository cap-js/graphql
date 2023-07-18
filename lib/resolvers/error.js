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

const _cdsToGraphQLError = (context, error) => {
  const locale = localeFrom(context.req)

  const message = getErrorMessage(error, locale)
  const code = error.code || error.message
  const details = error.details?.map(detail =>
    _sanitize({ ...detail, message: getErrorMessage(detail, locale), ..._getStackObj(detail) })
  )

  // Duplicate properties to ensure code and message come first, but aren't overwritten by properties from error object
  const extensions = _sanitize({ code, message, ...error, code, message, ..._getStackObj(error), details })

  // Remove nonmeaningful outer stacktrace if multiple errors are present
  if (extensions.details) delete extensions.stacktrace

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = (context, error) => {
  error = _ensureError(error)
  if (LOG._error) LOG.error(error)
  return _cdsToGraphQLError(context, error)
}
