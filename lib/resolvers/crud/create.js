const cds = require('@sap/cds')
const { INSERT } = cds.ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToEntries } = require('../parse/ast2cqn')
const { entriesStructureToEntityStructure } = require('./utils')
const GraphQLRequest = require('../GraphQLRequest')
const formatResult = require('../parse/ast/result')

// Always return array since multiple entries can be created (creating singletons not allowed)
const is2many = true
// Never return top level connection since pagination not possible
const isConnection = false

module.exports = async ({ req, res }, service, entity, selection) => {
  const query = INSERT.into(entity)

  const input = getArgumentByName(selection.arguments, ARGS.input)
  const entries = entriesStructureToEntityStructure(service, entity, astToEntries(input))
  query.entries(entries)

  const result = await service.dispatch(new GraphQLRequest({ req, res, query }))

  return formatResult(entity, selection, result, is2many, isConnection)
}
