const { Kind } = require('graphql')

const _objectFieldToOrderBy = objectField => ({
  ref: [objectField.name.value],
  sort: objectField.value.value
})

// OrderBy objects are supposed to contain only a single field
const _parseObjectValue = objectValue => _objectFieldToOrderBy(objectValue.fields[0])

const _parseListValue = listValue => listValue.values.map(value => _parseObjectValue(value))

const astToOrderBy = orderByArg => {
  const value = orderByArg.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value)
    case Kind.OBJECT:
      return [_parseObjectValue(value)]
  }
}

module.exports = astToOrderBy
