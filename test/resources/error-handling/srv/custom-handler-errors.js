const cds = require('@sap/cds')

module.exports = srv => {
  srv.on('READ', 'A', () => {
    const error = new Error('Error on READ A')
    Object.assign(error, { myProperty: 'My value A' })
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

  srv.before('CREATE', 'Orders', async (req) => {
    const { quantity, stock} = req.data
    if (quantity > stock) req.reject(400, 'ORDER_EXCEEDS_STOCK', [quantity, quantity - stock])
  })

  srv.on('READ', 'Z', async () => {
    return Promise.all([
      Promise.reject(new Error('A')),
      Promise.reject(new Error('B')),
    ])
  })
}
