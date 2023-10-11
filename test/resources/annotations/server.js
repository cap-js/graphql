const cds = require('@sap/cds')
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  path: '/custom-graphql-path', impl: '@cap-js/graphql'
}