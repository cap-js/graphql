const { CONNECTION_FIELDS } = require('../../../constants')

const _filterOutDuplicateColumnsSelections = selections => {
  const mergedSelectionsMap = new Map()

  for (const selection of selections) {
    if (!selection.selectionSet) continue
    for (const field of selection.selectionSet.selections) {
      const key = field.alias?.value || field.name.value
      const fieldFromMap = mergedSelectionsMap.get(key)
      if (!fieldFromMap) mergedSelectionsMap.set(key, field)
    }
  }

  return Array.from(mergedSelectionsMap.values())
}

const getPotentiallyNestedNodesSelections = selections => {
  const nodesSelections = selections.filter(selection => selection.name.value === CONNECTION_FIELDS.nodes)
  if (nodesSelections.length === 0) return selections
  return _filterOutDuplicateColumnsSelections(selections)
}

module.exports = { getPotentiallyNestedNodesSelections }
