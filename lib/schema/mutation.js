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

    const createInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, false)
    const updateInputObjectType = inputObjectGenerator(cache).entityToInputObjectType(entity, true)
    const filterInputObjectType = filterGenerator(cache).generateFilterForEntity(entity)

    const createArgs = {}
    const updateArgs = {}
    const deleteArgs = {}

    if (createInputObjectType) {
      createArgs[ARGS.input] = { type: new GraphQLNonNull(new GraphQLList(createInputObjectType)) }
    }

    // updateInputObjectType is undefined if it is generated for an entity that only contains key elements
    if (updateInputObjectType) {
      updateArgs[ARGS.input] = { type: new GraphQLNonNull(updateInputObjectType) }
    }

    // filterInputObjectType is undefined if the entity only contains elements that are associations or compositions
    if (filterInputObjectType) {
      updateArgs[ARGS.filter] = { type: filterInputObjectType }
      deleteArgs[ARGS.filter] = { type: filterInputObjectType }
    }

    const fields = {}
    if (createArgs[ARGS.input]) {
      fields.create = { type: new GraphQLList(entityObjectType), args: createArgs }
    }
    if (updateArgs[ARGS.filter] && updateArgs[ARGS.input]) {
      fields.update = { type: new GraphQLList(entityObjectType), args: updateArgs }
    }
    if (deleteArgs[ARGS.filter]) {
      fields.delete = { type: GraphQLInt, args: deleteArgs }
    }

    return new GraphQLObjectType({ name: gqlName(entity.name) + '_input', fields })
  }

  return { generateMutationObjectType }
}
