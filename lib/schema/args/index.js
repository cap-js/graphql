const { GraphQLInt } = require('graphql')
const { ARGS } = require('../../constants')
const filterGenerator = require('./filter')
const orderByGenerator = require('./orderBy')

module.exports = cache => {
  const generateArgumentsForType = cdsType => {
    const args = {
      [ARGS.top]: { type: GraphQLInt },
      [ARGS.skip]: { type: GraphQLInt }
    }
    const filter =
      cdsType.kind === 'entity'
        ? filterGenerator(cache).generateFilterForEntity(cdsType)
        : filterGenerator(cache).generateFilterForElement(cdsType, true)
    const orderBy =
      cdsType.kind === 'entity'
        ? orderByGenerator(cache).generateOrderByForEntity(cdsType)
        : orderByGenerator(cache).generateOrderByForElement(cdsType, true)
    if (filter) args[ARGS.filter] = { type: filter }
    if (orderBy) args[ARGS.orderBy] = { type: orderBy }

    return args
  }

  return { generateArgumentsForType }
}
