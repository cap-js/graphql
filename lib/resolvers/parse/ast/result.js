const { CONNECTION_FIELDS } = require('../../../constants')
const { isPlainObject } = require('../../utils')
const { getPotentiallyNestedNodesSelections } = require('../util')

const formatResult = (entity, field, result, is2many, isConnection) => {
  const _formatObject = (type, selections, object) => {
    const result = {}

    for (const key in object) {
      const value = object[key]

      const fields = selections.filter(s => s.alias?.value === key || s.name.value === key)

      for (const field of fields) {
        const element = type.elements[field.name.value]
        const elementType = element._target || element
        const responseKey = field.alias?.value || field.name.value
        const { is2many } = element
        result[responseKey] = _coerceToAndFormatByType(elementType, field, value, is2many, is2many)
      }
    }

    return result
  }

  const _aliasFieldsWithValue = (selections, name, value) =>
    selections
      .filter(selection => selection.name.value === name)
      .reduce((acc, selection) => {
        const responseKey = selection.alias?.value || selection.name.value
        acc[responseKey] = value
        return acc
      }, {})

  const _formatArray = (type, field, array, isConnection) => {
    const selections = field.selectionSet.selections
    const potentiallyNestedSelections = getPotentiallyNestedNodesSelections(selections, isConnection)
    const result = array.map(e => _formatObject(type, potentiallyNestedSelections, e))

    // REVISIT: requires differentiation for support of configurable schema flavors
    if (!isConnection) return result

    return {
      ..._aliasFieldsWithValue(selections, CONNECTION_FIELDS.nodes, result),
      ..._aliasFieldsWithValue(selections, CONNECTION_FIELDS.totalCount, result.$count)
    }
  }

  const _formatByType = (type, field, value, isConnection) => {
    if (Array.isArray(value)) return _formatArray(type, field, value, isConnection)

    if (isPlainObject(value)) return _formatObject(type, field.selectionSet.selections, value)

    return value
  }

  const _coerceToObjectOrArray = (value, is2many) => {
    if (is2many) return isPlainObject(value) ? [value] : value

    return Array.isArray(value) ? value[0] : value
  }

  const _coerceToAndFormatByType = (type, field, value, is2many, isConnection) =>
    _formatByType(type, field, _coerceToObjectOrArray(value, is2many), isConnection)

  return _coerceToAndFormatByType(entity, field, result, is2many, isConnection)
}

module.exports = formatResult
