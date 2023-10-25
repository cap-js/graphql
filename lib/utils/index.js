const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const toGQLName = cdsName =>
  cdsName
    .replace(/\./g, '_')
    .replace(/^[^_A-Za-z]*/g, '')
    .replace(/[^_0-9A-Za-z]*/g, '')

module.exports = { IS_PRODUCTION, toGQLName }
