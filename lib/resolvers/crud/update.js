const { SELECT, UPDATE } = require('@sap/cds/lib').ql
const cds = require('@sap/cds')
const { ARGS } = require('../../constants')
const formatResult = require('../parse/ast/result')
const { getArgumentByName, astToColumns, astToWhere, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')

module.exports = async (context, service, entity, selection) => {
  const args = selection.arguments

  const filter = getArgumentByName(args, ARGS.filter)

  const queryBeforeUpdate = SELECT.from(entity)
  queryBeforeUpdate.columns(astToColumns(selection.selectionSet.selections))

  if (filter) queryBeforeUpdate.where(astToWhere(filter))

  const query = UPDATE(entity)

  if (filter) query.where(astToWhere(filter))

  const input = getArgumentByName(args, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.with(entries)

  let resultBeforeUpdate
  const result = await service.tx(async tx => {
    // read needs to be done before the update, otherwise the where clause might become invalid (case that properties in where clause are updated by the mutation)
    const reqBeforeUpdate = new cds.Request({ req: context.req, query: queryBeforeUpdate })
    resultBeforeUpdate = await tx.dispatch(reqBeforeUpdate)
    if (resultBeforeUpdate.length === 0) return []

    const req = new cds.Request({ req: context.req, query })
    return await tx.dispatch(req)
  })

  // Merge selected fields with updated data
  const mergedResults = resultBeforeUpdate.map(original => ({ ...original, ...result }))

  return formatResult(selection, mergedResults, true)
}
