const cds = require('@sap/cds')
const { SchemaGenerator } = require('./schema')

function cds_compile_to_gql (csn) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(m.services.map(s => [s.name, new cds.ApplicationService(s.name, m)]))
  return new SchemaGenerator().generate(services).printSchema()
}

module.exports = cds_compile_to_gql
