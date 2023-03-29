const cds = require('@sap/cds')
const { SELECT } = require('@sap/cds/lib').ql
const { ARGS, CONNECTION_FIELDS } = require('../../constants')
const { getArgumentByName, astToColumns, astToWhere, astToOrderBy, astToLimit } = require('../parse/ast2cqn')
const formatResult = require('../parse/ast/result')

module.exports = async (context, service, entity, selection) => {
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

  const req = new cds.Request({ req: context.req, query })
  const result = await service.dispatch(req)

  return formatResult(selection, result)
}
