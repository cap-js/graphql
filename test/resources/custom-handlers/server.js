const cds = require('@sap/cds')
const path = require('path')
// Programmatic configuration of GraphQL protocol adapter
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  path: '/graphql', impl: path.join(__dirname, '../../../index.js')
}