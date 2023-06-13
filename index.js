const LOG = cds.log()
const GraphQLAdapter = require('./lib/GraphQLAdapter')

let services
module.exports = (srv, options) => {
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
