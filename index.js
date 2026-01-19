const cds = require('@sap/cds')
const DEBUG = cds.debug('adapters')
const GraphQLAdapter = require('./lib/GraphQLAdapter')
const { addLinkToIndexHtml } = require('./lib/utils')

let services
const collectServicesAndMountAdapter = (srv, options) => {
  if (!services) {
    services = {}

    cds.on('serving', service => {
      // Add link to GraphiQL in service index HTML
      addLinkToIndexHtml(service, options.path)
    })

    cds.on('served', () => {
      options.services = services
      cds.app.use (options.path, cds.middlewares.before, GraphQLAdapter(options), cds.middlewares.after)
      DEBUG?.('app.use(', options.path, ', ... )')
    })
  }
  services[srv.name] = srv
}

module.exports = collectServicesAndMountAdapter
