module.exports = srv => { 
  srv.on('READ', 'A', req => {
    const { my_header } = req.headers
    return [{ id: 'df81ea80-bbff-479a-bc25-8eb16efbfaec', my_header }]
  })
}