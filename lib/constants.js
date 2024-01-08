const CONNECTION_FIELDS = {
  nodes: 'nodes',
  totalCount: 'totalCount'
}

const ARGS = {
  input: 'input',
  filter: 'filter',
  orderBy: 'orderBy',
  top: 'top',
  skip: 'skip'
}

const RELATIONAL_OPERATORS = {
  eq: 'eq',
  ne: 'ne',
  gt: 'gt',
  ge: 'ge',
  le: 'le',
  lt: 'lt'
}

const LOGICAL_OPERATORS = {
  in: 'in'
}

const STRING_OPERATIONS = {
  startswith: 'startswith',
  endswith: 'endswith',
  contains: 'contains'
}

const OPERATOR_LIST_SUPPORT = {
  [RELATIONAL_OPERATORS.eq]: false,
  [RELATIONAL_OPERATORS.ne]: true,
  [RELATIONAL_OPERATORS.gt]: false,
  [RELATIONAL_OPERATORS.ge]: false,
  [RELATIONAL_OPERATORS.le]: false,
  [RELATIONAL_OPERATORS.lt]: false,
  [LOGICAL_OPERATORS.in]: true,
  [STRING_OPERATIONS.startswith]: false,
  [STRING_OPERATIONS.endswith]: false,
  [STRING_OPERATIONS.contains]: true
}

module.exports = {
  CONNECTION_FIELDS,
  ARGS,
  RELATIONAL_OPERATORS,
  LOGICAL_OPERATORS,
  STRING_OPERATIONS,
  OPERATOR_LIST_SUPPORT
}
