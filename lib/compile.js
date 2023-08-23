const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { printSchema, lexicographicSortSchema } = require('graphql')

function cds_compile_to_gql(csn, options = ({ object = false, sort = false } = {})) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(m.services.map(s => [s.name, new cds.ApplicationService(s.name, m)]))
  let schema = generateSchema4(services)

  if (options.sort) schema = lexicographicSortSchema(schema)
  if (options.object) return schema

  return printSchema(schema)
}

module.exports = cds_compile_to_gql
