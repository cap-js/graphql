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
  let result = await service.dispatch(cdsReq)
  if (typeof result === 'object' && 'affectedRows' in result) {
    let only_keys = true
    const entity_keys = Object.keys(entity.keys ?? {})
    for (let i = 0; i < result.data.length; i++) {
      const data_keys = Object.keys(result.data[i])
      if (!data_keys.every(k => entity_keys.includes(k))) {
        only_keys = false
        break
      }
    }
    if (only_keys) result = cdsReq.data
    else result = result.data
  }

  return formatResult(entity, selection, result, false)
}
