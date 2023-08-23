const cds = require('@sap/cds')
const protocols = cds.env.protocols ??= {}
if (!protocols.graphql) protocols.graphql = {
  path: "/graphql", impl: "@cap-js/graphql"
}
Object.assign(cds.compile.to, {
  get gql() { return super.gql = require('./lib/compile') },
  get graphql() { return super.graphql = require('./lib/compile') }
})