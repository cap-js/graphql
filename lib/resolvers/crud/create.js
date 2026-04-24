const cds = require('@sap/cds')
const { INSERT } = cds.ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')
const GraphQLRequest = require('../GraphQLRequest')
const formatResult = require('../parse/ast/result')

module.exports = async ({ req, res }, service, entity, selection) => {
  let query = INSERT.into(entity)

  const input = getArgumentByName(selection.arguments, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.entries(entries)

  const cdsReq = new GraphQLRequest({ req, res, query })
  const cdsRes = await service.dispatch(cdsReq)
  const result = cdsRes.affectedRows ? cdsReq.data : cdsRes

  return formatResult(entity, selection, result, false)
}
