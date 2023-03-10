const localeFrom = require('@sap/cds/lib/req/locale')
const { getErrorMessage } = require('@sap/cds/libx/_runtime/common/error/utils')
const { GraphQLError } = require('graphql')

const _logStackTraces = process.env.NODE_ENV !== 'production'

const _getStackObj = error => ({ ...(_logStackTraces && { stacktrace: error.stack?.split('\n') }) })

const _sanitize = error => {
  ;['target', 'args', 'entity', 'element', 'type', 'value', 'numericSeverity'].forEach(key => delete error[key])
  return error
}

const _cdsToGraphQLError = (context, error) => {
  const locale = localeFrom(context.req)

  const message = getErrorMessage(error, locale)
  const code = error.code || error.message
  const details = error.details?.map(detail =>
    _sanitize({
      ...detail,
      message: getErrorMessage(detail, locale),
      ..._getStackObj(detail)
    })
  )

  const extensions = _sanitize({ ...error, message, code, ..._getStackObj(error), details })

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = (context, error) => _cdsToGraphQLError(context, _ensureError(error))
