const { executeRead } = require('./crud')

module.exports = (context, service, entity, selection) => executeRead(service, entity, selection)
