const cds = require('@sap/cds')
const DEBUG = cds.debug('adapters')
const GraphQLAdapter = require('./lib/GraphQLAdapter')
const { WebSocketServer } = require('ws')

let services
const collectServicesAndMountAdapter = (srv, options) => {
  if (!services) {
    services = {}
    const wss = new WebSocketServer({ noServer: true })
    options.wss = wss
    cds.on('served', () => {
      options.services = services
      cds.app.use(options.path, cds.middlewares.before, GraphQLAdapter(options), cds.middlewares.after)
      DEBUG?.('app.use(', options.path, ', ... )')
    })
    cds.on('listening', app => {
      const { server } = app
      server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, ws => {
          wss.emit('connection', ws, request)
        })
      })
    })
  }
  services[srv.name] = srv
}

module.exports = collectServicesAndMountAdapter
