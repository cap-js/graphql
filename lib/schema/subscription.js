const { GraphQLObjectType } = require('graphql')
const { gqlName } = require('../utils')
const { isCompositionOfAspect } = require('./util')
const { shouldElementBeIgnored } = require('./util')
const { cdsToGraphQLScalarType } = require('./types/scalar')

module.exports = cache => {
  const generateSubscriptionObjectType = (services, subscriptions) => {
    const fields = {}

    for (const key in services) {
      const service = services[key]
      const serviceName = gqlName(service.name)
      const type = _serviceToObjectType(service)
      const subscription = subscriptions[serviceName]
      if (type) fields[serviceName] = { type, subscription }
    }

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({ name: 'Subscription', fields })
  }

  const _serviceToObjectType = service => {
    const fields = {}

    for (const key in service.events) {
      const event = service.events[key]

      if (isCompositionOfAspect(event)) continue

      const type = eventToObjectType(event)

      const name = gqlName(event.name.replace(service.name + '.', ''))
      fields[name] = { type }
    }

    if (Object.keys(fields).length === 0) return

    return new GraphQLObjectType({
      name: gqlName(service.name) + '_event',
      // REVISIT: Passed services currently don't directly contain doc property
      description: service.model.definitions[service.name].doc,
      fields
    })
  }

  const eventToObjectType = event => {
    const eventName = gqlName(event.name) + '_event'

    const cachedEventObjectType = cache.get(eventName)
    if (cachedEventObjectType) return cachedEventObjectType

    const fields = {}
    const newEventObjectType = new GraphQLObjectType({
      name: eventName,
      description: event.doc,
      fields: () => fields
    })
    cache.set(eventName, newEventObjectType)

    for (const name in event.elements) {
      const element = event.elements[name]

      const objectType = _elementToObjectType(element)
      const type = element.is2many ? new GraphQLList(objectType) : objectType
      if (type) {
        const field = { type, description: element.doc }
        fields[gqlName(name)] = field
      }
    }

    return newEventObjectType
  }

  const _elementToObjectType = element => {
    if (shouldElementBeIgnored(element)) return

    const gqlScalarType = cdsToGraphQLScalarType(element)
    if (element.isAssociation || element.isComposition) {
      const type = gqlScalarType || eventToObjectType(element._target)
      return element.is2one ? type : new GraphQLList(type)
    } else if (gqlScalarType) {
      return gqlScalarType
    }
  }

  return { generateSubscriptionObjectType }
}
