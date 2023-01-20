const isPlainObject = value => value !== null && typeof value === 'object' && !Buffer.isBuffer(value)

module.exports = { isPlainObject }
