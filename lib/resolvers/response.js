const { GraphQLError } = require('graphql')

const _logStackTraces = process.env.NODE_ENV !== 'production'

const _getStackObj = error => ({ ...(_logStackTraces && { stack: error.stack.split('\n') }) })

const _cdsToGraphQLError = error => {
  const details = error.details && error.details.map(detail => ({ ...detail, ..._getStackObj(detail) }))
  const extensions = { ...error, ..._getStackObj(error), details }

  return new GraphQLError(error.message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const setResponse = async (response, key, value) => {
  try {
    response[key] = await value
  } catch (e) {
    response[key] = _cdsToGraphQLError(_ensureError(e))
  }
}

module.exports = { setResponse }
