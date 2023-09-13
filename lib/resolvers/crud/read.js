const cds = require('@sap/cds/lib')
const { SELECT } = cds.ql
const { ARGS, CONNECTION_FIELDS } = require('../../constants')
const { getArgumentByName, astToColumns, astToWhere, astToOrderBy, astToLimit } = require('../parse/ast2cqn')
const GraphQLRequest = require('../GraphQLRequest')
const { isPlainObject } = require('../utils')
const formatResult = require('../parse/ast/result')

module.exports = async ({ req, res }, service, entity, selection) => {
  const selections = selection.selectionSet.selections
  const args = selection.arguments

  let query = SELECT.from(entity)
  query.columns(astToColumns(selection.selectionSet.selections))

  const filter = getArgumentByName(args, ARGS.filter)
  if (filter) {
    const where = astToWhere(filter)
    if (where) query.where(where)
  }

  const orderBy = getArgumentByName(args, ARGS.orderBy)
  if (orderBy) query.orderBy(astToOrderBy(orderBy))

  const top = getArgumentByName(args, ARGS.top)
  const skip = getArgumentByName(args, ARGS.skip)
  if (top) query.limit(astToLimit(top, skip))

  if (selections.find(s => s.name.value === CONNECTION_FIELDS.totalCount)) query.SELECT.count = true

  const result = await service.dispatch(new GraphQLRequest({ req, res, query }))

  const resultInArray = isPlainObject(result) ? [result] : result

  return formatResult(selection, resultInArray)
}
