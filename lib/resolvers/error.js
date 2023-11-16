const cds = require('@sap/cds')
const { i18n } = cds.env
const LOG_CDS = cds.log()
const LOG_GRAPHQL = cds.log('graphql')
const { GraphQLError } = require('graphql')
const { IS_PRODUCTION } = require('../utils')

// FIXME: importing internal modules from @sap/cds is discouraged and not recommended for external usage
const { normalizeError, isClientError } = require('@sap/cds/libx/_runtime/common/error/frontend')

const _reorderProperties = error => {
  // 'stack' and 'stacktrace' to cover both common cases that a custom error formatter might return
  let { code, message, details, stack, stacktrace } = error
  if (details) details = details.map(_reorderProperties)
  return { code, message, ...error, stack, stacktrace, details }
}

const _cdsToGraphQLError = (context, err) => {
  const { req, errorFormatter } = context
  let { error } = normalizeError(err, req, errorFormatter)

  // Ensure error properties are ordered nicely for the client
  error = _reorderProperties(error)

  const { message } = error
  const extensions = error

  // Top level message is already passed to GraphQLError to be used beside extensions -> not needed in extensions
  delete extensions.message

  const graphQLError = new GraphQLError(message, { extensions })

  return Object.defineProperty(graphQLError, '_cdsError', { value: true, writable: false, enumerable: false })
}

const _clone = obj => Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

// TODO: Revise this logging functionality, as it's not specific to protocol adapters.
// This function should be relocated and/or cleaned up when the new abstract/generic
// protocol adapter is designed and implemented.
const _log = error => {
  // log errors and warnings only
  if (LOG_CDS.level <= cds.log.levels.WARN) return

  // Clone of the original error object to prevent mutation and unintended side-effects.
  // Notice that the cloned error is logged to standard output in its default language,
  // whereas the original error message is locale-dependent as it is usually sent in the
  // HTTP response to HTTP Clients to be displayed in the user interface.
  let error2log = _clone(error)
  if (error.details) {
    error2log.details = error.details.map(error => _clone(error))

    // Excluding the stack trace for the outer error as the inner stack trace already
    // contains the initial segment of the outer stack trace.
    delete error2log.stack
  }

  error2log = normalizeError(error2log, { locale: i18n.default_language }, error => error).error

  // determine if the status code represents a client error (4xx range)
  if (isClientError(error2log)) {
    if (LOG_CDS._warn) LOG_CDS.warn(error2log)
  } else {
    // server error
    if (LOG_CDS._error) LOG_CDS.error(error2log)
  }
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const handleCDSError = (context, error) => {
  error = _ensureError(error)
  _log(error)
  return _cdsToGraphQLError(context, error)
}

const formatError = error => {
  // Note: error is not always an instance of GraphQLError

  // CDS errors have already been logged and already have a stacktrace in extensions
  if (error.originalError?._cdsError) return error

  if (LOG_GRAPHQL._error) LOG_GRAPHQL.error(error)

  // error does not have an extensions property when it is not an instance of GraphQLError
  if (!IS_PRODUCTION && error.extensions) error.extensions.stacktrace = error.stack.split('\n')

  return error
}

module.exports = { handleCDSError, formatError }
