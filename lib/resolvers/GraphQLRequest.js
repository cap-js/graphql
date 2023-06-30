const cds = require('@sap/cds/lib')

class GraphQLRequest extends cds.Request {
  constructor(args) {
    super(args)
    Object.defineProperty(this, 'protocol', { value: 'graphql' })
  }
}

module.exports = GraphQLRequest
