const cds = require('@sap/cds')
const { INSERT } = cds.ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')
const GraphQLRequest = require('../GraphQLRequest')
const formatResult = require('../parse/ast/result')

const _only_keys = (entity, data) => {
  const entity_keys = { ...(entity.keys ?? {}), IsActiveEntity: 1 }
  return data.every(d => Object.keys(d).every(k => k in entity_keys))
}

module.exports = async ({ req, res }, service, entity, selection) => {
  let query = INSERT.into(entity)

  const input = getArgumentByName(selection.arguments, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.entries(entries)

  const cdsReq = new GraphQLRequest({ req, res, query })
  let result = await service.dispatch(cdsReq)
  if (Array.isArray(result) && 'affected' in result) {
    result = !_only_keys(entity, result) ? result : cdsReq.data
  }

  return formatResult(entity, selection, result, false)
}
