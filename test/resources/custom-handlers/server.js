const cds = require('@sap/cds')
const path = require('path')

cds.env.protocols = {
  graphql: { endpoint: '/graphql', impl: path.join(__dirname, '../../../index.js') }
}