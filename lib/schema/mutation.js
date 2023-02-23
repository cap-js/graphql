const cds = require('@sap/cds/lib')
const { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql')
const { gqlName } = require('../utils')
const objectGenerator = require('./types/object')
const filterGenerator = require('./args/filter')
const inputObjectGenerator = require('./args/input')
const { ARGS } = require('../constants')

module.exports = cache => {
  const generateMutationObjectType = (services, resolvers) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      if (!(service instanceof cds.ApplicationService)) continue

      const serviceName = gqlName(service.name)
      const resolve = resolvers[serviceName]
      fields[serviceName] = { type: _serviceToObjectType(service), resolve }
    }

    return new GraphQLObjectType({ name: 'Mutation', fields })
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.entities) {
      const entity = service.entities[key]
      const entityName = gqlName(key)

      fields[entityName] = { type: _entityToObjectType(entity) }
    }

    return new GraphQLObjectType({ name: gqlName(service.name) + '_input', fields })
  }

  const _entityToObjectType = entity => {
    const entityObjectType = objectGenerator(cache).entityToObjectType(entity)

    const createInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, '_C')
    const updateInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, '_U')
    const filterInputObjectType = filterGenerator(cache).generateFilterForEntity(entity)

    const createArgs = {
      [ARGS.input]: { type: new GraphQLNonNull(new GraphQLList(createInputObjectType)) }
    }
    const updateArgs = {
      [ARGS.input]: { type: new GraphQLNonNull(updateInputObjectType) }
    }
    const deleteArgs = {}

    if (filterInputObjectType) {
      updateArgs[ARGS.filter] = { type: filterInputObjectType }
      deleteArgs[ARGS.filter] = { type: filterInputObjectType }
    }

    const fields = {
      create: { type: new GraphQLList(entityObjectType), args: createArgs },
      update: { type: new GraphQLList(entityObjectType), args: updateArgs },
      delete: { type: GraphQLInt, args: deleteArgs }
    }

    return new GraphQLObjectType({ name: gqlName(entity.name) + '_input', fields })
  }

  return { generateMutationObjectType }
}
