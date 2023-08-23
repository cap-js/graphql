const cds = require('@sap/cds')

// Register gql and graphql as cds.compile.to targets
Object.defineProperty(cds.compile.to, 'gql', {
  get: () => require('./compile')
})
Object.defineProperty(cds.compile.to, 'graphql', {
  get: () => require('./compile')
})
