const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.CDS_ENV === 'prod'

const gqlName = cdsName => cdsName.replace(/\./g, '_')

function isGQLService(service) {
  if (!service) return false
  // Check for @graphql annotation (direct property or via definition)
  if (service['@graphql'] || service.definition?.['@graphql']) return true
  // Check for @protocol annotation (direct property or via definition)
  const protocol = service['@protocol'] || service.definition?.['@protocol']
  if (protocol) {
    if (typeof protocol === 'string') return protocol === 'graphql'
    if (Array.isArray(protocol)) return protocol.includes('graphql')
  }
  return false
}

function addLinkToIndexHtml(service) {
  const gqlProvider = (entity, endpoint) => {
    if (entity) return
    if (endpoint?.kind !== 'graphql') return
    return { href: '/graphql', name: 'GraphiQL', title: 'Show in GraphiQL' }
  }

  service.$linkProviders.push(gqlProvider)
}

module.exports = { IS_PRODUCTION, gqlName, isGQLService, addLinkToIndexHtml }
