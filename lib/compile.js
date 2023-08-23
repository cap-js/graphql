const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { printSchema } = require('graphql')

function cds_compile_to_gql(csn) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(m.services.map(s => [s.name, new cds.ApplicationService(s.name, m)]))
  return printSchema(generateSchema4(services))
}

module.exports = cds_compile_to_gql
