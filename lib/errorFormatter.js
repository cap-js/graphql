const { IS_PRODUCTION } = require('./utils')

const ALLOWED_PROPERTIES_IN_PRODUCTION = ['message', 'target', 'details']

const _sanitizeProperty = (key, value, out) => {
  if (key === 'i18nKey') return (out['code'] = value)

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

  if (err.i18nKey) properties.push('i18nKey')

  // No stack for outer error of multiple errors, since the stack is not meaningful
  if (!err.details) properties.push('stack')

  properties.forEach(k => _sanitizeProperty(k, err[k], error))

  return error
}

module.exports = errorFormatterFn
