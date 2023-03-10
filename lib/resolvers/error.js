const { normalizeError } = require('@sap/cds/libx/_runtime/common/error/frontend')
const { GraphQLError } = require('graphql')

const _sanitize = error => {
  delete error['@Common.numericSeverity']
  return error
}

const _cdsToGraphQLError = (context, error) => {
  error = normalizeError(error, context.req).error
  const details = error.details?.map(detail => _sanitize({ ...detail }))
  const extensions = _sanitize({ ...error, details })
  return new GraphQLError(error.message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = (context, error) => _cdsToGraphQLError(context, _ensureError(error))
