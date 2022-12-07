const isPlainObject = value => typeof value === 'object' && !Buffer.isBuffer(value)

module.exports = { isPlainObject }