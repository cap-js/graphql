const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const gqlName = cdsName => cdsName.replace(/\./g, '_')

module.exports = { IS_PRODUCTION, gqlName }
