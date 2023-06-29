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

const _to_xpr = (ref, gqlOperator, value) => {
  const cdsOperator = _gqlOperatorToCdsOperator(gqlOperator)
  const val = { val: value }

  if (STRING_OPERATIONS[gqlOperator]) return [{ func: cdsOperator, args: [ref, val] }]
  return [ref, cdsOperator, val]
}

const _objectFieldTo_xpr = (objectField, columnName) => {
  const ref = { ref: [columnName] }
  const gqlOperator = objectField.name.value

  if (objectField.value.kind === Kind.LIST) {
    const _xprs = objectField.value.values.map(value => _to_xpr(ref, gqlOperator, value.value))
    return _joinedXprFrom_xprs(_xprs, 'and')
  }

  return _to_xpr(ref, gqlOperator, objectField.value.value)
}

const _parseObjectField = (objectField, columnName) => {
  if (columnName) return _objectFieldTo_xpr(objectField, columnName)

  const value = objectField.value
  const name = objectField.name.value
  switch (value.kind) {
    case Kind.LIST:
      return _parseListValue(value, name)
    case Kind.OBJECT:
      return _parseObjectValue(value, name)
  }
}

const _arrayInsertBetweenFlat = (array, element) =>
  array.flatMap((e, index) => (index === array.length - 1 ? [e] : [e, element])).flat()

const _joinedXprFrom_xprs = (_xprs, operator) => ({ xpr: _arrayInsertBetweenFlat(_xprs, operator) })

const _true_xpr = [{ val: 1 }, '=', { val: 1 }]

const _parseObjectValue = (objectValue, columnName) => {
  const _xprs = objectValue.fields
    .map(field => _parseObjectField(field, columnName))
    .filter(field => field !== undefined)
  if (_xprs.length === 0) return _true_xpr
  else if (_xprs.length === 1) return _xprs[0]
  return _joinedXprFrom_xprs(_xprs, 'and')
}

const _false_xpr = [{ val: 0 }, '=', { val: 1 }]

const _parseListValue = (listValue, columnName) => {
  const _xprs = listValue.values.map(value => _parseObjectValue(value, columnName)).filter(value => value !== undefined)
  if (_xprs.length === 0) return _false_xpr
  else if (_xprs.length === 1) return _xprs[0]
  return _joinedXprFrom_xprs(_xprs, 'or')
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
