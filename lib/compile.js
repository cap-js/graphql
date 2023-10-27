const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { lexicographicSortSchema, printSchema } = require('graphql')

function cds_compile_to_gql(csn, options = {}) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(m.services.map(s => [s.name, new cds.ApplicationService(s.name, m)]))
  const gqlServices = Object.fromEntries(
    Object.entries(services).filter(([_, service]) =>
      service.definition.endpoints.some(e => e.kind.match(/graphql/))
    )
  )

  let schema = generateSchema4(gqlServices)

  if (options.sort) schema = lexicographicSortSchema(schema)
  if (/^obj|object$/i.test(options.as)) return schema

  return printSchema(schema)
}

module.exports = cds_compile_to_gql
