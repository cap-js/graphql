const cds = require('@sap/cds')
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  path: "/graphql", impl: "@cap-js/graphql"
}
