const { SELECT } = require('@sap/cds/lib').ql
const { ARGS, CONNECTION_FIELDS } = require('../../constants')
const { getArgumentByName, astToColumns, astToWhere, astToOrderBy, astToLimit } = require('../parse/ast2cqn')
const formatResult = require('../parse/ast/result')
const { isPlainObject } = require('../utils')

module.exports = async (service, entity, selection) => {
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

  const result = await service.run(query)

  const resultInArray = isPlainObject(result) ? [result] : result

  return formatResult(selection, resultInArray)
}
