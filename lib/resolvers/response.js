const localeFrom = require('@sap/cds/lib/req/locale')
const { getErrorMessage } = require('@sap/cds/libx/_runtime/common/error/utils')
const { GraphQLError } = require('graphql')

const _logStackTraces = process.env.NODE_ENV !== 'production'

const _getStackObj = error => ({ ...(_logStackTraces && { stack: error.stack?.split('\n') }) })

const _cdsToGraphQLError = (context, error) => {
  const locale = localeFrom(context.req)

  const message = getErrorMessage(error, locale)
  const code = error.code || error.message
  const details = error.details?.map(detail => ({
    ...detail,
    message: getErrorMessage(detail, locale),
    ..._getStackObj(detail)
  }))

  const extensions = { ...error, message, code, ..._getStackObj(error), details }

  return new GraphQLError(message, { extensions })
}

const _ensureError = error => (error instanceof Error ? error : new Error(error))

const setResponse = async (context, response, key, value) => {
  try {
    response[key] = await value
  } catch (e) {
    response[key] = _cdsToGraphQLError(context, _ensureError(e))
  }
}

module.exports = { setResponse }
