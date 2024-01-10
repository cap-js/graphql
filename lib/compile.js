const cds = require('@sap/cds')
const { generateSchema4 } = require('./schema')
const { lexicographicSortSchema, printSchema } = require('graphql')

const _isServiceAnnotatedWithGraphQL = service => {
  const { definition } = service

  if (definition['@graphql']) return true

  const protocol = definition['@protocol']
  if (protocol) {
    // @protocol: 'graphql' or @protocol: ['graphql', 'odata']
    const protocols = Array.isArray(protocol) ? protocol : [protocol]
    // Normalize objects such as { kind: 'graphql' } to strings
    return protocols.map(p => (typeof p === 'object' ? p.kind : p)).some(p => p.match(/graphql/i))
  }

  return false
}

function cds_compile_to_gql(csn, options = {}) {
  const m = cds.linked(csn)
  const services = Object.fromEntries(
    m.services
      .map(s => [s.name, new cds.ApplicationService(s.name, m)])
      // Only compile services with GraphQL endpoints
      .filter(([_, service]) => _isServiceAnnotatedWithGraphQL(service))
  )

  let schema = generateSchema4(services)

  if (options.sort) schema = lexicographicSortSchema(schema)
  if (/^obj|object$/i.test(options.as)) return schema

  return printSchema(schema)
}

module.exports = cds_compile_to_gql
