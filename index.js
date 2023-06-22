const cds = require('@sap/cds')
const LOG = cds.log()
const GraphQLAdapter = require('./lib/GraphQLAdapter')

let services
const _collectServicesAndServe = (srv, options) => {
  if (!services) {
    services = {}
    cds.on('served', () => {
      options.services = services
      cds.app.use (options.path, cds.middlewares.before, GraphQLAdapter(options), cds.middlewares.after)
      LOG.info('serving', { protocol: 'graphql', at: options.path })
    })
  }
  services[srv.name] = srv
}

_collectServicesAndServe.GraphQLAdapter = GraphQLAdapter

module.exports = _collectServicesAndServe
