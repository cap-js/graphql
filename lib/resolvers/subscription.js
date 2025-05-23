const { gqlName } = require('../utils')

module.exports = (service, event) =>
  async function* (root, args, context, info) {
    const eventName = event.name.replace(service.name + '.', '')
    const gqlEventName = gqlName(event.name)

    // while (true) {
    //   const msg = await new Promise(resolve => service.once(eventName, resolve))
    //   yield { [gqlEventName]: msg.data }
    // }

    const queue = []
    service.on(eventName, msg => queue.push(msg))
    while (true) {
      if (queue.length > 0) {
        do {
          const msg = queue.shift()
          yield { [gqlEventName]: msg.data }
        } while (queue.length > 0)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
