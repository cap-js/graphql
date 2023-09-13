const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const filterGenerator = require('./args/filter')
const inputObjectGenerator = require('./args/input')
const { ARGS } = require('../constants')
const { isCompositionOfAspect } = require('./util')

module.exports = cache => {
  const generateMutationObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = gqlName(service.name)
      const resolve = resolvers[serviceName]
      const type = _serviceToObjectType(service)
      if (type) fields[serviceName] = { type, resolve }
    }

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({ name: 'Mutation', fields })
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]

      if (isCompositionOfAspect(entity)) continue

      const entityName = gqlName(key)
      const type = _entityToObjectType(entity)
      if (type) fields[entityName] = { type }
    }

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({ name: gqlName(service.name) + '_input', fields })
  }

  const _entityToObjectType = entity => {
    // Filter out undefined fields
    const fields = Object.fromEntries(
      Object.entries({
        create: _create(entity),
        update: _update(entity),
        delete: _delete(entity)
      }).filter(([_, v]) => v)
    )

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({ name: gqlName(entity.name) + '_input', fields })
  }

  const _create = entity => {
    const entityObjectType = objectGenerator(cache).entityToObjectType(entity)

    const createInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, false)
    if (!createInputObjectType) return

    const args = {
      [ARGS.input]: { type: new GraphQLNonNull(new GraphQLList(createInputObjectType)) }
    }
    return { type: new GraphQLList(entityObjectType), args }
  }

  const _update = entity => {
    const entityObjectType = objectGenerator(cache).entityToObjectType(entity)

    const filterInputObjectType = filterGenerator(cache).generateFilterForEntity(entity)
    const updateInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, true)
    // filterInputObjectType is undefined if the entity only contains elements that are associations or compositions
    // updateInputObjectType is undefined if it is generated for an entity that only contains key elements
    if (!filterInputObjectType || !updateInputObjectType) return

    const args = {
      [ARGS.filter]: { type: new GraphQLNonNull(filterInputObjectType) },
      [ARGS.input]: { type: new GraphQLNonNull(updateInputObjectType) }
    }
    return { type: new GraphQLList(entityObjectType), args }
  }

  const _delete = entity => {
    const filterInputObjectType = filterGenerator(cache).generateFilterForEntity(entity)
    // filterInputObjectType is undefined if the entity only contains elements that are associations or compositions
    if (!filterInputObjectType) return

    const args = {
      [ARGS.filter]: { type: new GraphQLNonNull(filterInputObjectType) }
    }
    return { type: GraphQLInt, args }
  }

  return { generateMutationObjectType }
}
