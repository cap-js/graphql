const cds = require('@sap/cds')

// Register gql and graphql as cds.compile.to targets
Object.defineProperties(cds.compile.to, {
  gql: {
    get: () => require('./compile')
  },
  graphql: {
    get: () => require('./compile')
  }
})
