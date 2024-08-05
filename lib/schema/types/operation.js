const { cdsToGraphQLScalarType } = require('./scalar')
const { gqlName } = require('../../utils')

module.exports = cache => {
  const operationToField = operation => {
    // Ignore non-scalar return types for now
    if (operation.returns && !operation.returns._type) return

    const gqlScalarType = cdsToGraphQLScalarType(operation.returns)
    const type = gqlScalarType

    const args = {}

    for (const key in operation.params) {
      const param = operation.params[key]
      const type = cdsToGraphQLScalarType(param)
      args[gqlName(key)] = { type }
    }

    return { type, args }
  }

  return { operationToField }
}
