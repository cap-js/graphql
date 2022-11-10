const cds = require('@sap/cds/lib')
const { gqlName } = require('../utils')
const resolveQuery = require('./query')
const resolveMutation = require('./mutation')
const { enrichAST } = require('./parse/ast')

const _wrapResolver = (service, resolver) => (root, args, context, info) => {
  const response = {}

  const enrichedFieldNodes = enrichAST(info)

  for (const fieldNode of enrichedFieldNodes) {
    for (const field of fieldNode.selectionSet.selections) {
      const fieldName = field.name.value
      const entity = service.entities[fieldName]
      const responseKey = field.alias?.value || fieldName

      response[responseKey] = resolver(service, entity, field)
    }
  }

  return response
}

module.exports = services => {
  const Query = {}
  const Mutation = {}

  for (const key in services) {
    const service = services[key]
    if (!(service instanceof cds.ApplicationService)) continue

    const gqlServiceName = gqlName(service.name)
    Query[gqlServiceName] = _wrapResolver(service, resolveQuery)
    Mutation[gqlServiceName] = _wrapResolver(service, resolveMutation)
  }

  return { Query, Mutation }
}
