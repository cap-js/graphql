const cds = require('@sap/cds')

class GraphQLRequest extends cds.Request {
  constructor(args) {
    super(args)
    Object.defineProperty(this, 'protocol', { value: 'graphql' })
  }
}

module.exports = GraphQLRequest
