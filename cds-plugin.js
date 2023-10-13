const cds = require('@sap/cds')
require('./lib/api').registerCompileTargets()
const defaults = { path: '/graphql', impl: '@cap-js/graphql' }
const protocols = cds.env.protocols ??= {}
protocols.graphql ??= {}
protocols.graphql = { ...defaults, ...protocols.graphql}
