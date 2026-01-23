const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.CDS_ENV === 'prod'

const gqlName = cdsName => cdsName.replace(/\./g, '_')

function addLinkToIndexHtml(service, path) {
  const gqlProvider = (entity, endpoint) => {
    if (entity) return
    if (endpoint?.kind !== 'graphql') return
    return { href: path, name: 'GraphiQL', title: 'Show in GraphiQL' }
  }

  if (!service.$linkProviders) service.$linkProviders = []
  service.$linkProviders.push(gqlProvider)
}

module.exports = { IS_PRODUCTION, gqlName, addLinkToIndexHtml }
