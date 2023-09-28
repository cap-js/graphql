const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('READ', 'A', () => {
    const error = new Error('Error on READ A')
    Object.assign(error, {
      myProperty: 'My value A1',
      $myProperty: 'My value A2',
      my: { nested: { property: 'My value A3' } },
      $my: { nested: { property: 'My value A4' } }
    })
    throw error
  })

  srv.on('READ', 'B', () => {
    throw 'Error on READ B'
  })

  srv.on('READ', 'C', () => {
    throw new cds.error('Error on READ C')
  })

  srv.on('READ', 'D', () => {
    cds.error('MY_CODE', { code: 'MY_CODE', myProperty: 'My value D1', $myProperty: 'My value D2' })
  })

  srv.on('READ', 'E', async req => {
    req.error({
      code: 'Some-Custom-Code',
      message: 'Some Custom Error Message',
      target: 'some_field',
      status: 418
    })
  })

  srv.on('READ', 'F', async req => {
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

  srv.on('READ', 'G', async req => {
    // 'modify' property is checked in service level error handler
    req.error({ code: '418', message: 'Error on READ G', modify: true })
  })

  srv.on('error', err => {
    // 'modify' property is set in error thrown by READ G handler
    if (err.modify) {
      err.message = 'Oh no! ' + err.message
      err.myProperty = 'My value G1'
      err.$myProperty = 'My value G2'
      delete err.modify
    }
  })

  srv.before('CREATE', 'Orders', async req => {
    const { id, quantity, stock } = req.data
    if (quantity > stock) {
      const code = 'ORDER_EXCEEDS_STOCK'
      const message = code
      const args = [quantity, quantity - stock]

      if (id === 1) req.reject(400, message, args)
      if (id === 2) req.reject(code, message, args)
      req.reject(message)
    }
  })
}
