const { GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql')
const { toGQLName } = require('../../utils')
const argsGenerator = require('../args')
const { shouldElementBeIgnored } = require('../util')
const { cdsToGraphQLScalarType } = require('../types/scalar')
const { CONNECTION_FIELDS } = require('../../constants')

module.exports = cache => {
  const entityToObjectConnectionType = entity => {
    const name = toGQLName(entity.name) + '_connection'

    const cachedEntityObjectConnectionType = cache.get(name)
    if (cachedEntityObjectConnectionType) return cachedEntityObjectConnectionType

    const fields = {}
    const newEntityObjectConnectionType = new GraphQLObjectType({ name, fields: () => fields })
    cache.set(name, newEntityObjectConnectionType)

    fields[CONNECTION_FIELDS.nodes] = { type: new GraphQLList(entityToObjectType(entity)) }
    fields[CONNECTION_FIELDS.totalCount] = { type: GraphQLInt }

    return newEntityObjectConnectionType
  }

  const _getUnusedName = (cache, name) => {
    const _cacheGet = key => (cache instanceof Map ? cache.get(key) : cache[key])
    let newName = name
    let i = 1
    while (_cacheGet(newName)) {
      newName = `${name}_${i}`
      i++
    }
    return newName
  }

  const entityToObjectType = entity => {
    const entityName = toGQLName(entity.name)

    const cachedEntityObjectType = cache.get(entityName)
    if (cachedEntityObjectType) return cachedEntityObjectType

    const fields = {}
    const newEntityObjectType = new GraphQLObjectType({
      name: entityName,
      description: entity.doc,
      fields: () => fields
    })
    cache.set(entityName, newEntityObjectType)

    for (const name in entity.elements) {
      const element = entity.elements[name]

      // REVISIT: requires differentiation for support of configurable schema flavors
      const type = element.is2many ? _elementToObjectConnectionType(element) : _elementToObjectType(element)
      if (!type) continue

      const field = { type, description: element.doc }
      if (element.is2many) field.args = argsGenerator(cache).generateArgumentsForType(element)

      const gqlName = _getUnusedName(fields, toGQLName(name))
      field.extensions = { cds: { name } }
      element.gql = { name: gqlName }

      fields[gqlName] = field
    }

    return newEntityObjectType
  }

  const _elementToObjectType = element => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      const type = gqlScalarType || entityToObjectType(element._target)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  const _elementToObjectConnectionType = element => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element._type)
    return entityToObjectConnectionType(gqlScalarType || element._target)
  }

  return { entityToObjectConnectionType, entityToObjectType }
}
