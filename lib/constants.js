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

const STRING_OPERATIONS = {
  startswith: 'startswith',
  endswith: 'endswith',
  contains: 'contains'
}

module.exports = {
  CONNECTION_FIELDS,
  ARGS,
  RELATIONAL_OPERATORS,
  STRING_OPERATIONS
}
