module.exports = srv => { 
  const my_res_header = 'my res header value'

  srv.on(['CREATE', 'READ', 'UPDATE'], 'A', req => {
    req.res?.header(Object.keys({my_res_header})[0], my_res_header)
    const { my_header } = req.headers
    return [{ id: 'df81ea80-bbff-479a-bc25-8eb16efbfaec', my_header }]
  })

  srv.on('DELETE', 'A', req => {
    req.res?.header(Object.keys({my_res_header})[0], my_res_header)
    const { my_header } = req.headers
    return my_header ? 999 : 0
  })
}