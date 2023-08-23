const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { printSchema } = require('graphql')

function cds_compile_to_gql(csn, options = { object = false } = {}) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(m.services.map(s => [s.name, new cds.ApplicationService(s.name, m)]))
  const schema = generateSchema4(services)
  if (options.object) return schema
  return printSchema(schema)
}

module.exports = cds_compile_to_gql
