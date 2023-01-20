const { RELATIONAL_OPERATORS, STRING_OPERATIONS } = require('../../../constants')
const { Kind } = require('graphql')

const GQL_TO_CDS_STRING_OPERATIONS = {
  [STRING_OPERATIONS.startswith]: 'startswith',
  [STRING_OPERATIONS.endswith]: 'endswith',
  [STRING_OPERATIONS.contains]: 'contains'
}

const GQL_TO_CDS_QL_OPERATOR = {
  [RELATIONAL_OPERATORS.eq]: '=',
  [RELATIONAL_OPERATORS.ne]: '!=',
  [RELATIONAL_OPERATORS.gt]: '>',
  [RELATIONAL_OPERATORS.ge]: '>=',
  [RELATIONAL_OPERATORS.le]: '<=',
  [RELATIONAL_OPERATORS.lt]: '<'
}

const _gqlOperatorToCdsOperator = gqlOperator =>
  GQL_TO_CDS_QL_OPERATOR[gqlOperator] || GQL_TO_CDS_STRING_OPERATIONS[gqlOperator]

const _objectFieldTo_xpr = (objectField, columnName) => {
  const gqlOperator = objectField.name.value
  const cdsOperator = _gqlOperatorToCdsOperator(gqlOperator)

  const ref = { ref: [columnName] }
  const val = { val: objectField.value.value }

  if (STRING_OPERATIONS[gqlOperator]) return [_genericFn(cdsOperator, [ref, val])]

  return [ref, cdsOperator, val]
}

const _genericFn = (methodName, args, operator) => ({ func: `${operator ? `${operator} ` : ''}${methodName}`, args })

const _parseObjectField = (objectField, columnName) => {
  const value = objectField.value
  const name = objectField.name.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value, name)
    case Kind.OBJECT:
      return _parseObjectValue(value, name)
  }
  return _objectFieldTo_xpr(objectField, columnName)
}

const _arrayInsertBetweenFlat = (array, element) =>
  array.flatMap((e, index) => (index === array.length - 1 ? [e] : [e, element])).flat()

const _joinedXprFrom_xprs = (_xprs, operator) => ({ xpr: _arrayInsertBetweenFlat(_xprs, operator) })

const _parseObjectValue = (objectValue, columnName) => {
  const _xprs = objectValue.fields.map(field => _parseObjectField(field, columnName))
  return _xprs.length === 1 ? _xprs[0] : _joinedXprFrom_xprs(_xprs, 'and')
}

const _parseListValue = (listValue, columnName) => {
  const _xprs = listValue.values.map(value => _parseObjectValue(value, columnName))
  return _xprs.length === 1 ? _xprs[0] : _joinedXprFrom_xprs(_xprs, 'or')
}

const astToWhere = filterArg => {
  const value = filterArg.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value)
    case Kind.OBJECT:
      return _parseObjectValue(value)
  }
}

module.exports = astToWhere
