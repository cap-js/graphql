const cds = require('@sap/cds/lib')
const { INSERT } = cds.ql
const { ARGS } = require('../../constants')
const formatResult = require('../parse/ast/result')
const { getArgumentByName, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')

module.exports = async (req, service, entity, selection) => {
  let query = INSERT.into(entity)

  const input = getArgumentByName(selection.arguments, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.entries(entries)

  const result = await service.dispatch(new cds.Request({ req, query }))
  const resultInArray = Array.isArray(result) ? result : [result]

  return formatResult(selection, resultInArray, true)
}
