const { getPotentiallyNestedNodesSelections } = require('../util')
const { getArgumentByName } = require('./utils')
const astToWhere = require('./where')
const astToOrderBy = require('./orderBy')
const astToLimit = require('./limit')
const { ARGS } = require('../../../constants')

const astToColumns = selections => {
  let columns = []

  for (const selection of getPotentiallyNestedNodesSelections(selections)) {
    const args = selection.arguments

    const fieldName = selection.name.value
    const column = { ref: [fieldName] }
    if (selection.alias) column.as = selection.alias.value

    if (selection.selectionSet?.selections) {
      const columns = astToColumns(selection.selectionSet.selections)
      // columns is empty if only __typename was selected (which was filtered out in the enriched AST)
      column.expand = columns.length > 0 ? columns : ['*']
    }

    const filter = getArgumentByName(args, ARGS.filter)
    if (filter) column.where = astToWhere(filter)

    const orderBy = getArgumentByName(args, ARGS.orderBy)
    if (orderBy) column.orderBy = astToOrderBy(orderBy)

    const top = getArgumentByName(args, ARGS.top)
    const skip = getArgumentByName(args, ARGS.skip)
    if (top) column.limit = astToLimit(top, skip)

    columns.push(column)
  }

  return columns
}

module.exports = astToColumns
