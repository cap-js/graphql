const cds = require('@sap/cds')

// Register gql and graphql as cds.compile.to options
Object.assign(cds.compile.to, {
  get gql() { return super.gql = require('./lib/compile') },
  get graphql() { return super.graphql = require('./lib/compile') }
})
