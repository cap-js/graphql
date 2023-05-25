const cds = require('@sap/cds')
const path = require('path')

cds.env.protocols = {
  graphql: { endpoint: '/custom-graphql-endpoint', impl: path.join(__dirname, '../../../index.js') }
}