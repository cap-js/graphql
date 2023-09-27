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

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const handleCDSError = (context, error) => {
  error = _ensureError(error)
  // TODO: choose log level depending on type of error analogous to OData adapter
  if (LOG_CDS._error) LOG_CDS.error(error)
  return _cdsToGraphQLError(context, error)
}

const formatError = error => {
  // CDS errors have already been logged and already have a stacktrace in extensions
  if (error.originalError?._cdsError) return error

  if (LOG_GRAPHQL._error) LOG_GRAPHQL.error(error)

  if (!IS_PRODUCTION) error.extensions.stacktrace = error.stack.split('\n')

  return error
}

module.exports = { handleCDSError, formatError }
