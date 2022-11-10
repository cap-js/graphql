const { Kind } = require('graphql')

const _parseObjectField = objectField => {
  const value = objectField.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value)
    case Kind.OBJECT:
      return _parseObjectValue(value)
  }
  return value.value
}

const _parseObjectValue = objectValue =>
  objectValue.fields.reduce((entry, objectField) => {
    entry[objectField.name.value] = _parseObjectField(objectField)
    return entry
  }, {})

const _parseListValue = listValue => listValue.values.map(value => _parseObjectValue(value))

const astToEntries = inputArg => {
  const value = inputArg.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value)
    case Kind.OBJECT:
      return _parseObjectValue(value)
  }
}

module.exports = astToEntries
