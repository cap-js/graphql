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

  if (cds.env.features.cds_validate) {
    const assertOptions = { mandatories: true }
    const errs = cds.validate(entries, entity, assertOptions)
    if (errs) {
      if (errs.length === 1) throw errs[0]
      throw Object.assign(new Error('MULTIPLE_ERRORS'), { statusCode: 400, details: errs })
    }
  }

  const result = await service.dispatch(new GraphQLRequest({ req, res, query }))

  return formatResult(entity, selection, result, false)
}
