const cds = require('@sap/cds')
const path = require('path')

cds.env.protocols = {
  graphql: { path: '/custom-graphql-path', impl: path.join(__dirname, '../../../index.js') }
}