const { cdsToGraphQLScalarType } = require('./scalar')
const objectGenerator = require('../types/object')
const inputObjectGenerator = require('../args/input')
const { gqlName } = require('../../utils')
const { GraphQLList } = require('graphql')

module.exports = (cache, service) => {
  const operationToField = operation => {
    const type = _returnTypeToType(operation)
    if (!type) return

    const args = _paramsToArgs(operation.params)

    return { type, args }
  }

  const _returnTypeToType = operation => {
    const { returns } = operation
    if (!returns) return cdsToGraphQLScalarType()

    const isArrayed = returns.kind === 'type' && returns.items
    const returnType = isArrayed ? returns.items : returns

    const type = (() => {
      const scalarType = cdsToGraphQLScalarType(returnType)
      if (scalarType) return scalarType

      const entity = service.model.definitions[returnType.type]
      if (entity) return objectGenerator(cache).entityToObjectType(entity)

      if (returnType.elements) {
        const name = gqlName(operation.name) + '_struct'
        const structured = { ...returnType, name }
        return objectGenerator(cache).entityToObjectType(structured)
      }
    })()

    if (!type) return

    if (isArrayed) return new GraphQLList(type)

    return type
  }

  const _paramsToArgs = params => {
    const args = {}

    for (const key in params) {
      const param = params[key]

      const type = (() => {
        if (param._type) return cdsToGraphQLScalarType(param)
        
        const entity = service.model.definitions[param.type]
        return inputObjectGenerator(cache).entityToInputObjectType(entity, false)
      })()

      args[gqlName(key)] = { type }
    }

    return args
  }

  return { operationToField }
}
