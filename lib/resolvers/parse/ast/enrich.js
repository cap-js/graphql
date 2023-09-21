const { Kind, visit, typeFromAST, TypeInfo, visitWithTypeInfo, getVariableValues } = require('graphql')
const { fragmentSpreadSelections, _substituteFragment } = require('./fragment')
const substituteVariable = require('./variable')
const removeMetaFieldsFromSelections = require('./meta')

const _traverseObjectValue = (info, objectValue, _fields) =>
  objectValue.fields.forEach(field => {
    const _field = _fields[field.name.value]
    _traverseArgumentOrObjectField(info, field, _field)
  })

const _traverseListValue = (info, listValue, _fields) => {
  for (let i = 0; i < listValue.values.length; i++) {
    const value = listValue.values[i]
    switch (value.kind) {
      case Kind.VARIABLE:
        listValue.values[i] = substituteVariable(info, value)
        break
      case Kind.OBJECT:
        _traverseObjectValue(info, value, _fields)
        break
    }
  }
}

const _isScalarKind = kind => kind === Kind.INT || kind === Kind.FLOAT || kind === Kind.STRING || kind === Kind.BOOLEAN

const _traverseArgumentOrObjectField = (info, argumentOrObjectField, _fieldOr_arg) => {
  const value = argumentOrObjectField.value

  const type = _getTypeFrom_fieldOr_arg(_fieldOr_arg)
  if (_isScalarKind(value.kind)) value.value = type.parseLiteral(value)

  switch (value.kind) {
    case Kind.VARIABLE:
      argumentOrObjectField.value = substituteVariable(info, value)
      break
    case Kind.LIST:
      _traverseListValue(info, value, type.getFields?.())
      break
    case Kind.OBJECT:
      _traverseObjectValue(info, value, type.getFields())
      break
  }

  // Convenience value for both literal and variable values
  // if (argumentOrObjectField.value?.kind === Kind.NULL) argumentOrObjectField.value.value = null
}

const _traverseSelectionSet = (info, selectionSet, _fields) => {
  // selectionSet.selections = fragmentSpreadSelections(info, selectionSet.selections)
  // selectionSet.selections = removeMetaFieldsFromSelections(selectionSet.selections)
  selectionSet.selections.forEach(field => {
    const _field = _fields[field.name.value]
    _traverseField(info, field, _field)
  })
}

const _getTypeFrom_fieldOr_arg = _field => {
  let type = _field.type
  while (type.ofType) type = type.ofType
  return type
}

const _traverseField = (info, field, _field) => {
  if (field.selectionSet) {
    const type = _getTypeFrom_fieldOr_arg(_field)
    _traverseSelectionSet(info, field.selectionSet, type.getFields())
  }

  field.arguments.forEach(arg => {
    const _arg = _field.args.find(a => a.name === arg.name.value)
    _traverseArgumentOrObjectField(info, arg, _arg)
  })
}

const _traverseFieldNodes = (info, fieldNodes, _fields) =>
  fieldNodes.forEach(fieldNode => {
    const _field = _fields[fieldNode.name.value]
    _traverseField(info, fieldNode, _field)
  })

// TODO: does not yet work correctly, need to go along fields, args and input objects
const _directPath = (node, ancestors) =>
  ancestors
    .concat(node)
    .filter(
      e => e.kind === Kind.FIELD || e.kind === Kind.ARGUMENT || e.kind === Kind.OBJECT_FIELD || e.kind === Kind.ARGUMENT
    )
    .map(e => ({ kind: e.kind, name: e.name.value }))

// TODO: does not yet work correctly, need to go along fields, args and input objects
const _getTypeFrom_fields = (_fields, path, index = 0) => {
  const { kind, name } = path[index++]
  const _field = _fields[name]
  const type = _getTypeFrom_fieldOr_arg(_field)

  if (index < path.length) return _getTypeFrom_fields(type.getFields(), path, index)

  return type
}

module.exports = info => {
  const deepClonedFieldNodes = JSON.parse(JSON.stringify(info.fieldNodes))

  const rootTypeName = info.parentType.name
  const rootType = info.schema.getType(rootTypeName)

  const typeInfo = new TypeInfo(info.schema)

  const editedAST = visit(
    info.fieldNodes,
    visitWithTypeInfo(typeInfo, {
      enter(node) {
        const type = typeInfo.getType()
        const inputType = typeInfo.getInputType()
      },
      [Kind.FRAGMENT_SPREAD](node) {
        return _substituteFragment(info, node)[0]
      },
      [Kind.FIELD](node) {
        if (node.name?.value === '__typename') return null
      },
      // TODO: visit scalar types directly instead
      [Kind.OBJECT_FIELD](node, key, parent, path, ancestors) {
        const value = node.value
        if (!_isScalarKind(value.kind)) return

        typeFromAST(info.schema, node)

        const _fields = rootType.getFields()
        const directPath = _directPath(node, ancestors)
        const type = _getTypeFrom_fields(_fields, directPath) // TODO: get type using path and ancestors
        value.value = type.parseLiteral(value) // TODO: order in combination with variable substitution may be important
      },
      // [Kind.SCALAR_TYPE_DEFINITION](node) {
      //   debugger
      // },
      [Kind.VARIABLE](node) {
        return substituteVariable(info, node)
      },
      // [Kind.VARIABLE_DEFINITION](node) {
      //   debugger
      //   getVariableValues(info.schema, [node], info.variableValues)
      // },
      [Kind.NULL](node) {
        node.value = null
      }
    })
  )

  // _traverseFieldNodes(info, editedAST, rootType.getFields())

  return editedAST
}
