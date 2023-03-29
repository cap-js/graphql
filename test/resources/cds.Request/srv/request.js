module.exports = srv => { 
  srv.on(['CREATE', 'READ', 'UPDATE'], 'A', req => {
    const { my_header } = req.headers
    return [{ id: 'df81ea80-bbff-479a-bc25-8eb16efbfaec', my_header }]
  })

  srv.on('DELETE', 'A', req => {
    const { my_header } = req.headers
    return my_header ? 999 : 0
  })
}