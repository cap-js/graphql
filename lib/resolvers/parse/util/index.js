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

const getPotentiallyNestedNodesSelections = (selections, isConnection) =>
  isConnection ? _filterOutDuplicateColumnsSelections(selections) : selections

module.exports = { getPotentiallyNestedNodesSelections }
