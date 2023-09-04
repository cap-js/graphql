const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('READ', 'A', () => {
    const error = new Error('Error on READ A')
    Object.assign(error, {
      myProperty: 'My value A1',
      my: { nested: { property: 'My value A2' } }
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
    throw new cds.error('MY_CODE', { code: 'MY_CODE', myProperty: 'My value D' })
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
