const isPlainObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value)

module.exports = { isPlainObject }
