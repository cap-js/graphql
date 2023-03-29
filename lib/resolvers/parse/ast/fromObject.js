const { Kind } = require('graphql')
const { isPlainObject } = require('./util')

const _nullValue = { kind: Kind.NULL }

const _valueToGenericScalarValue = value => ({
  kind: 'GenericScalarValue',
  value
})

const _keyToName = key => ({
  kind: Kind.NAME,
  value: key
})

const _keyValueToObjectField = (k, v) => ({
  kind: Kind.OBJECT_FIELD,
  name: _keyToName(k),
  value: _variableToValue(v)
})

const _objectToObjectValue = object => ({
  kind: Kind.OBJECT,
  fields: Object.entries(object).map(([k, v]) => _keyValueToObjectField(k, v))
})

const _arrayToListValue = array => ({
  kind: Kind.LIST,
  values: array.map(a => _variableToValue(a))
})

const _variableToValue = variable => {
  if (Array.isArray(variable)) {
    return _arrayToListValue(variable)
  } else if (isPlainObject(variable)) {
    return _objectToObjectValue(variable)
  } else if (variable === null) {
    return _nullValue
  } else if (variable === undefined) {
    return undefined
  }
  return _valueToGenericScalarValue(variable)
}

module.exports = variableValue => _variableToValue(variableValue)
