const cds = require('@sap/cds')
const { SELECT, UPDATE } = cds.ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToColumns, astToWhere, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')
const GraphQLRequest = require('../GraphQLRequest')
const formatResult = require('../parse/ast/result')
const { isPlainObject } = require('../utils')

module.exports = async ({ req, res }, service, entity, selection) => {
  const args = selection.arguments

  const filter = getArgumentByName(args, ARGS.filter)

  const queryBeforeUpdate = SELECT.from(entity)
  if (entity._isSingleton) queryBeforeUpdate.SELECT.one = true

  queryBeforeUpdate.columns(astToColumns(entity, selection.selectionSet.selections, false))

  if (filter) queryBeforeUpdate.where(astToWhere(filter))

  const query = UPDATE(entity)

  if (filter) query.where(astToWhere(filter))

  const input = getArgumentByName(args, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.with(entries)

  let resultBeforeUpdate
  const result = await service.tx(async tx => {
    // read needs to be done before the update, otherwise the where clause might become invalid
    // (case that properties in where clause are updated by the mutation)
    resultBeforeUpdate = await tx.dispatch(new GraphQLRequest({ req, res, query: queryBeforeUpdate }))
    if (Array.isArray(resultBeforeUpdate) && resultBeforeUpdate.length === 0) return {}

    return await tx.dispatch(new GraphQLRequest({ req, res, query }))
  })

  let mergedResults = result
  if (Array.isArray(resultBeforeUpdate)) {
    // Merge selected fields with updated data
    mergedResults = resultBeforeUpdate.map(original => ({ ...original, ...result }))
  } else if (isPlainObject(resultBeforeUpdate)) {
    mergedResults = { ...resultBeforeUpdate, ...result }
  }

  return formatResult(entity, selection, mergedResults, false)
}
