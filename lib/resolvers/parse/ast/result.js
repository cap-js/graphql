const { CONNECTION_FIELDS } = require('../../../constants')
const { isPlainObject } = require('../../utils')
const { getPotentiallyNestedNodesSelections } = require('../util')

const formatResult = (field, result, skipTopLevelConnection) => {
  const _formatObject = (selections, object) => {
    for (const key in object) {
      const value = object[key]
      delete object[key]

      const fields = selections.filter(s => s.alias?.value === key || s.name.value === key)

      for (const field of fields) {
        const responseKey = field.alias?.value || field.name.value
        object[responseKey] = _formatByType(field, value)
      }
    }
    return object
  }

  const _aliasFieldsWithValue = (selections, name, value) =>
    selections
      .filter(selection => selection.name.value === name)
      .reduce((acc, selection) => {
        const responseKey = selection.alias?.value || selection.name.value
        acc[responseKey] = value
        return acc
      }, {})

  const _formatArray = (field, array, skipTopLevelConnection) => {
    const selections = field.selectionSet.selections
    const potentiallyNestedSelections = getPotentiallyNestedNodesSelections(selections)
    array.map(e => _formatObject(potentiallyNestedSelections, e))

    // REVISIT: requires differentiation for support of configurable schema flavors
    if (skipTopLevelConnection) return array

    return {
      ..._aliasFieldsWithValue(selections, CONNECTION_FIELDS.nodes, array),
      ..._aliasFieldsWithValue(selections, CONNECTION_FIELDS.totalCount, array.$count)
    }
  }

  const _formatByType = (field, value, skipTopLevelConnection) => {
    if (Array.isArray(value)) {
      return _formatArray(field, value, skipTopLevelConnection)
    } else if (isPlainObject(value)) {
      return _formatObject(field.selectionSet.selections, value)
    }
    return value
  }

  return _formatByType(field, result, skipTopLevelConnection)
}

module.exports = formatResult
