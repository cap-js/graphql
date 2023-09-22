const { Kind, visit } = require('graphql')
const { fragmentSpreadSelections, _substituteFragment } = require('./fragment')
const substituteVariable = require('./variable')
const removeMetaFieldsFromSelections = require('./meta')

const _isScalarKind = kind => kind === Kind.INT || kind === Kind.FLOAT || kind === Kind.STRING || kind === Kind.BOOLEAN

const _getTypeFrom_fieldOr_arg = _field => {
  let type = _field.type
  while (type.ofType) type = type.ofType
  return type
}

const _directPath = (node, ancestors) =>
  ancestors
    .concat(node)
    .filter(e => e.kind === Kind.FIELD || e.kind === Kind.ARGUMENT || e.kind === Kind.OBJECT_FIELD)
    .map(e => ({ kind: e.kind, name: e.name.value }))

const _getTypeFrom_fields = (_fields, path, index = 0) => {
  const { name } = path[index++]

  const _field = _fields[name]
  const type = _getTypeFrom_fieldOr_arg(_field)

  if (type.parseLiteral) return type

  if (path[index].kind === Kind.ARGUMENT) {
    const arg = _field.args.find(a => a.name === path[index].name)
    const type = _getTypeFrom_fieldOr_arg(arg)

    if (type.parseLiteral) return type

    return _getTypeFrom_fields(type.getFields(), path, index + 1)
  }

  return _getTypeFrom_fields(type.getFields(), path, index)
}

const _parseNonVariableLiterals = rootFields => (node, key, parent, path, ancestors) => {
  const value = node.value
  if (!_isScalarKind(value.kind)) return

  if (value.skipParsing) return

  const simplifiedPath = _simplifiedPath(node, ancestors)
  const type = _getTypeFrom_fields(rootFields, simplifiedPath)
  value.value = type.parseLiteral(value)
}

module.exports = info => {
  const deepClonedFieldNodes = JSON.parse(JSON.stringify(info.fieldNodes))

  const rootTypeName = info.parentType.name
  const rootType = info.schema.getType(rootTypeName)
  const rootFields = rootType.getFields()

  const editedAST = visit(deepClonedFieldNodes, {
    [Kind.FRAGMENT_SPREAD](node) {
      return _substituteFragment(info, node)[0]
    },
    [Kind.FIELD](node) {
      if (node.name?.value === '__typename') return null
    },
    [Kind.OBJECT_FIELD]: _parseNonVariableLiterals(rootFields),
    [Kind.ARGUMENT]: _parseNonVariableLiterals(rootFields),
    [Kind.VARIABLE](node) {
      return substituteVariable(info, node)
    },
    [Kind.NULL](node) {
      node.value = null
    }
  })

  return editedAST
}
