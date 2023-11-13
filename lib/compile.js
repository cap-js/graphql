const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { lexicographicSortSchema, printSchema } = require('graphql')

function cds_compile_to_gql(csn, options = {}) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(
    m.services
      .map(s => [s.name, new cds.ApplicationService(s.name, m)])
      // Only compile services with graphql endpoints
      .filter(([_, service]) => service.definition.endpoints.some(e => e.kind.match(/graphql/i)))
  )

  let schema = generateSchema4(services)

  if (options.sort) schema = lexicographicSortSchema(schema)
  if (/^obj|object$/i.test(options.as)) return schema

  return printSchema(schema)
}

module.exports = cds_compile_to_gql
