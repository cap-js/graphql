const { Kind } = require('graphql')

const _getTypeFrom_fieldOr_arg = _field => {
  let { type } = _field
  while (type.ofType) type = type.ofType
  return type
}

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

const _simplifiedPath = (node, ancestors) =>
  ancestors
    .concat(node)
    .filter(e => [Kind.FIELD, Kind.ARGUMENT, Kind.OBJECT_FIELD].includes(e.kind))
    .map(e => ({ kind: e.kind, name: e.name.value }))

const _isScalarKind = kind => [Kind.INT, Kind.FLOAT, Kind.STRING, Kind.BOOLEAN].includes(kind)

// Literals are provided unparsed within the AST, contrary to variable values
const parseLiteral = rootFields => (node, _key, _parent, _path, ancestors) => {
  const { value } = node
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

module.exports = parseLiteral