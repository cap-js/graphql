module.exports = srv => {
  srv.on('READ', 'A', async req => {
    req.error({
      code: 'Some-Custom-Code1',
      message: 'Some Custom Error Message 1',
      target: 'some_field',
      status: 418
    })
    req.error({
      code: 'Some-Custom-Code2',
      message: 'Some Custom Error Message 2',
      target: 'some_field',
      status: 500
    })
  })
}
