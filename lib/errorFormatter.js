const { IS_PRODUCTION } = require('./utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['code', 'message', 'target', 'details']

const _sanitizeProperty = (key, value, out) => {
  if (IS_PRODUCTION) {
    if (ALLOWED_PROPERTIES_IN_PRODUCTION.includes(key)) return (out[key] = value)
    if (key.startsWith('$')) return (out[key] = value)
    return
  }

  if (key === 'stack') return (out['stacktrace'] = value.split('\n'))

  return (out[key] = value)
}

const errorFormatterFn = err => {
  const error = {}

  const properties = Object.keys(err).concat('message')

  // No stack for outer error of multiple errors, since the stack is not meaningful
  if (!err.details) properties.push('stack')

  properties.forEach(k => _sanitizeProperty(k, err[k], error))

  return error
}

module.exports = errorFormatterFn
