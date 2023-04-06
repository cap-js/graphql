module.exports = srv => {
  const string = 'foo'
  const id = '0557a188-326e-4dcb-999b-e1acf7979fa3'

  srv.on('*', 'Integer', () => 999)
  srv.on('*', 'String', () => string)
  srv.on('*', 'Object', () => ({ id, string }))
  srv.on('*', 'Array', () => [{ id, string }, { id, string }])
}