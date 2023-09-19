let _count = 0

module.exports = err => {
  const message = 'Oops! ' + err.message
  const custom = 'This property is added by the custom error formatter'
  const count = _count++
  const details = err.details // Exists if this is an outer error of multiple errors

  // Return a copy of the error with the desired formatting
  return { message, custom, count, details}
}