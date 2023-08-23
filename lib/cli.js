const cds = require('@sap/cds')

// Register gql and graphql as cds.compile.to targets
Object.assign(cds.compile.to, {
  get gql() {
    return (super.gql = require('./compile'))
  },
  get graphql() {
    return (super.graphql = require('./compile'))
  }
})
