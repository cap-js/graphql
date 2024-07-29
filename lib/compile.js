const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { lexicographicSortSchema, printSchema } = require('graphql')

function cds_compile_to_gql(csn, options = {}) {
  const model = cds.linked(csn)
  const serviceinfo = cds.compile.to.serviceinfo(csn, options)
  const services = Object.fromEntries(
    model.services
      .map(s => [s.name, new cds.ApplicationService(s.name, model)])
      // Only compile services with GraphQL endpoints
      .filter(([_, service]) =>
        serviceinfo.find(s => s.name === service.name)?.endpoints.some(e => e.kind === 'graphql')
      )
  )

  let schema = generateSchema4(services)

  if (options.sort) schema = lexicographicSortSchema(schema)
  if (/^obj|object$/i.test(options.as)) return schema

  return printSchema(schema)
}

module.exports = cds_compile_to_gql
