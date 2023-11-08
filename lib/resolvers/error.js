const cds = require('@sap/cds')
const LOG_CDS = cds.log()
const LOG_GRAPHQL = cds.log('graphql')
const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

const _reorderProperties = error => {
  // 'stack' and 'stacktrace' to cover both common cases that a custom error formatter might return
  let { code, message, details, stack, stacktrace } = error
  if (details) details = details.map(_reorderProperties)
  return { code, message, ...error, stack, stacktrace, details }
}

const _cdsToGraphQLError = (context, err) => {
  const { req, errorFormatter } = context
  const options = { filterFn: errorFormatter, locale: req.locale }
  let { error } = normalizeError(err, req, options)

  // Ensure error properties are ordered nicely for the client
  error = _reorderProperties(error)

  const { message } = error
  const extensions = error

  // Top level message is already passed to GraphQLError to be used beside extensions -> not needed in extensions
  delete extensions.message

  const graphQLError = new GraphQLError(message, { extensions })

  return Object.defineProperty(graphQLError, '_cdsError', { value: true, writable: false, enumerable: false })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))
const _clone = obj => Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

const handleCDSError = (context, error) => {
  error = _ensureError(error)
  _log(context.req, error)
  return _cdsToGraphQLError(context, error)
}

const _log = (req, error) => {
  // do not log standard errors, e.g. TypeError
  if (error.code === undefined && error.details === undefined) return

  // log errors and warnings only
  if (LOG_CDS.level <= cds.log.levels.WARN) return

  // Clone of the original error object to prevent mutation and unintended side-effects.
  // Notice that the cloned error is logged to standard output in its default language,
  // whereas the original error message is locale-dependent as it is usually sent in the
  // HTTP response to HTTP Clients to be displayed in the user interface.
  const error2log = _clone(error)
  if (error.details) error2log.details = error.details.map(error => _clone(error))

  const errorOptions = { locale: 'en', filterFn: null }
  const statusCode = normalizeError(error2log, _clone(req), errorOptions).statusCode

  // determine if the status code represents a client error (4xx range)
  if (statusCode >= 400 && statusCode < 500) {
    if (LOG_CDS._warn) LOG_CDS.warn(error2log)
  } else {
    // server error
    if (LOG_CDS._error) LOG_CDS.error(error2log)
  }
}

const formatError = error => {
  // CDS errors have already been logged and already have a stacktrace in extensions
  if (error.originalError?._cdsError) return error

  if (LOG_GRAPHQL._error) LOG_GRAPHQL.error(error)

  if (!IS_PRODUCTION) error.extensions.stacktrace = error.stack.split('\n')

  return error
}

module.exports = { handleCDSError, formatError }
