const cds = require('@sap/cds')

const _lazy = () => require('./compile')

// Register gql and graphql as cds.compile.to targets
Object.defineProperties(cds.compile.to, {
  gql: {
    get: _lazy
  },
  graphql: {
    get: _lazy
  }
})
