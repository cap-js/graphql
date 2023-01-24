const cds = require('@sap/cds')
const path = require('path')

cds.env.protocols = {
  graphql: { path: '/graphql', impl: path.join(__dirname, '../../../index.js') }
}