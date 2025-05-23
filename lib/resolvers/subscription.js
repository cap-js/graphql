const { gqlName } = require('../utils')

class Queue {
  constructor() {
    this.queue = []
    this.#reset()
  }

  #reset() {
    this.wait = new Promise(resolve => {
      this.resolve = resolve
    })
  }

  push(e) {
    this.queue.push(e)
    this.resolve()
    this.#reset()
  }

  async pop() {
    if (!this.queue.length) await this.wait
    return this.queue.shift()
  }
}

module.exports = (service, event) =>
  async function* (root, args, context, info) {
    const eventName = event.name.replace(service.name + '.', '')
    const gqlEventName = gqlName(event.name)

    const queue = new Queue()
    service.on(eventName, msg => queue.push(msg))

    while (true) {
      const msg = await queue.pop()
      yield { [gqlEventName]: msg.data }
    }
  }
