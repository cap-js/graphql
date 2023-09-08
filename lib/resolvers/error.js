const cds = require('@sap/cds')
const LOG_CDS = cds.log()
const LOG_GRAPHQL = cds.log('graphql')
const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['message', 'target', 'details']

const _sanitizeProperty = (key, value, out) => {
  if (key === 'i18nKey') {
    out['code'] = value
    return
  }

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

const _errorFormatterFn = err => {
  const error = {}

  const properties = Object.keys(err).concat('message')

  if (err.i18nKey) properties.push('i18nKey')

  // No stack for outer error of multiple errors, since the stack is not meaningful
  if (!err.details) properties.push('stack')

  properties.forEach(k => _sanitizeProperty(k, err[k], error))

  return error
}

const _reorderProperties = error => {
  let { code, message, details, stack } = error
  if (details) details = details.map(_reorderProperties)
  return { code, message, ...error, stack, details }
}

const _cdsToGraphQLError = (context, err) => {
  let { error } = normalizeError(err, context.req, _errorFormatterFn)

  // Ensure error properties are ordered nicely for the client
  error = _reorderProperties(error)

  const message = error.message
  const extensions = error

  const graphQLError = new GraphQLError(message, { extensions })

  return Object.defineProperty(graphQLError, '_cdsError', { value: true, writable: false, enumerable: false })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const handleCDSError = (context, error) => {
  error = _ensureError(error)
  // TODO: choose log level depending on type of error analogous to OData adapter
  if (LOG_CDS._error) LOG_CDS.error(error)
  return _cdsToGraphQLError(context, error)
}

const formatError = error => {
  // CDS errors already have a stacktrace in extensions
  if (error.originalError?._cdsError) return error

  if (LOG_GRAPHQL._error) LOG_GRAPHQL.error(error)

  if (!IS_PRODUCTION) error.extensions.stacktrace = error.stack.split('\n')

  return error
}

module.exports = { handleCDSError, formatError }
