const cds = require('@sap/cds')
const path = require('path')
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  path: '/custom-graphql-path', impl: path.join(__dirname, '../../../index.js')
}