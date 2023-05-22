const { gqlName } = require('../utils')
const resolveQuery = require('./query')
const resolveMutation = require('./mutation')
const { enrichAST } = require('./parse/ast')
const { setResponse } = require('./response')

const _wrapResolver = (service, resolver, parallel) =>
  async function CDSRootResolver(root, args, context, info) {
    const response = {}

    const enrichedFieldNodes = enrichAST(info)

    const _getResponse = field => {
      const fieldName = field.name.value
      const entity = service.entities[fieldName]
      const responseKey = field.alias?.value || fieldName

      const value = resolver(context, service, entity, field)

      return { key: responseKey, value }
    }

    const _getAndSetResponse = async field => {
      const { key, value } = _getResponse(field)
      await setResponse(context, response, key, value)
    }

    if (parallel) {
      await Promise.all(
        enrichedFieldNodes.map(fieldNode =>
          Promise.allSettled(fieldNode.selectionSet.selections.map(async field => await _getAndSetResponse(field)))
        )
      )
    } else {
      // REVISIT: should mutation resolvers run in same transaction or separate transactions?
      for (const fieldNode of enrichedFieldNodes) {
        for (const field of fieldNode.selectionSet.selections) {
          await _getAndSetResponse(field)
        }
      }
    }

    return response
  }

module.exports = services => {
  const Query = {}
  const Mutation = {}

  for (const key in services) {
    const service = services[key]
    const gqlServiceName = gqlName(service.name)
    Query[gqlServiceName] = _wrapResolver(service, resolveQuery, true)
    Mutation[gqlServiceName] = _wrapResolver(service, resolveMutation, false)
  }

  return { Query, Mutation }
}
