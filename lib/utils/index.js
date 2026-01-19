const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.CDS_ENV === 'prod'

const gqlName = cdsName => cdsName.replace(/\./g, '_')

function addLinkToIndexHtml(service) {
  const gqlProvider = (entity, endpoint) => {
    if (entity) return
    if (endpoint?.kind !== 'graphql') return
    return { href: '/graphql', name: 'GraphiQL', title: 'Show in GraphiQL' }
  }

  service.$linkProviders.push(gqlProvider)
}

module.exports = { IS_PRODUCTION, gqlName, addLinkToIndexHtml }
