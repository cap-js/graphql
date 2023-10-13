const cds = require('@sap/cds')
// Programmatic configuration of GraphQL protocol adapter
const protocols = cds.env.protocols ??= {}
protocols.graphql = { path: '/graphql', impl: '@cap-js/graphql' }