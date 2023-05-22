const cds = require('@sap/cds')
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  endpoint: "/graphql", impl: "@cap-js/graphql"
}
