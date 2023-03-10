const cds = require('@sap/cds')
const LOG = cds.log()
const localeFrom = require('@sap/cds/lib/req/locale')
const { getErrorMessage } = require('@sap/cds/libx/_runtime/common/error/utils')
const { GraphQLError } = require('graphql')

const IS_PRODUCTION = process.env.NODE_ENV !== 'production'
const DISALLOWED_PROPERTIES = ['args', 'entity', 'element', 'type', 'value', 'numericSeverity']

const _getStackObj = error => ({ ...(IS_PRODUCTION && { stacktrace: error.stack?.split('\n') }) })

const _sanitize = error => {
  DISALLOWED_PROPERTIES.forEach(key => delete error[key])
  return error
}

const _cdsToGraphQLError = (context, error) => {
  const locale = localeFrom(context.req)

  const message = getErrorMessage(error, locale)
  const code = error.code || error.message
  const details = error.details?.map(detail =>
    _sanitize({ ...detail, message: getErrorMessage(detail, locale), ..._getStackObj(detail) })
  )

  const extensions = _sanitize({ ...error, message, code, ..._getStackObj(error), details })

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = (context, error) => {
  error = _ensureError(error)
  if (LOG._error) LOG.error(error)
  return _cdsToGraphQLError(context, error)
}
