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

const _simplifiedPath = (node, ancestors) =>
  ancestors
    .concat(node)
    .filter(e => e.kind === Kind.FIELD || e.kind === Kind.ARGUMENT || e.kind === Kind.OBJECT_FIELD)
    .map(e => ({ kind: e.kind, name: e.name.value }))

const _getTypeFrom_fields = (_fields, path, index = 0) => {
  const { name } = path[index++]

  const _field = _fields[name]
  const type = _getTypeFrom_fieldOr_arg(_field)

  // If type has the parseLiteral function it is a scalar type -> leaf -> end of path
  if (type.parseLiteral) return type

  // Is the next path element an argument? If yes, follow the argument
  if (path[index].kind === Kind.ARGUMENT) {
    const arg = _field.args.find(a => a.name === path[index].name)
    const type = _getTypeFrom_fieldOr_arg(arg)

    // If type has the parseLiteral function it is a scalar type -> leaf -> end of path
    // This case occurs when the argument itself is a scalar type, e.g. Books(top: 1)
    if (type.parseLiteral) return type

    return _getTypeFrom_fields(type.getFields(), path, index + 1)
  }

  return _getTypeFrom_fields(type.getFields(), path, index)
}
// Literals are provided unparsed within the AST, contrary to variable values
const _parseNonVariableLiterals = rootFields => (node, key, parent, path, ancestors) => {
  const value = node.value
  if (!_isScalarKind(value.kind)) return

  // Set for variable values that have been substituted into the AST, which are already parsed
  if (value.skipParsing) {
    delete value.skipParsing
    return
  }

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
      // Substitute fragments into the AST as if they were inline fields
      // Prevents the necessity for special handling of fragments in AST to CQN
      return _substituteFragment(info, node)[0]
    },
    [Kind.FIELD](node) {
      // Remove __typename from selections to prevent field from being interpreted as DB column
      // Instead let graphql framework determine the type
      if (node.name?.value === '__typename') return null
    },
    [Kind.OBJECT_FIELD]: _parseNonVariableLiterals(rootFields),
    [Kind.ARGUMENT]: _parseNonVariableLiterals(rootFields),
    [Kind.VARIABLE](node) {
      // Substitute variable values into the AST as if they were literal values
      // Prevents the necessity for special handling of variables in AST to CQN
      return substituteVariable(info, node)
    },
    [Kind.NULL](node) {
      // Convenience value for handling of null values in AST to CQN
      node.value = null
    }
  })

  return editedAST
}
