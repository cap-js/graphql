const { gqlName } = require('../utils')

module.exports = (service, event) =>
  async function* (root, args, context, info) {
    const eventName = gqlName(event.name)

    yield { [eventName]: { counter: 0 } }
  }
