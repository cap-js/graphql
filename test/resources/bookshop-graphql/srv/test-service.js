const cds = require('@sap/cds')

module.exports = cds.service.impl(srv => {
  const { Foo } = srv.entities
  // dummy read to prove that same tx is used (= no blocked tx on sqlite)
  srv.before('*', () => SELECT.from(Foo))
  srv.on('hello', (req) => {
    let {to} = req.data
    if (to === 'me') to = require('os').userInfo().username
    return `Hello ${to}!`
  })
  srv.on('cancelOrder', async (req) => {
    const { orderID, reason } = req.data
    return { acknowledge: `Aknowledged cancelation of order ${orderID}`, message: `Canceled for reason: ${reason}` }
  })
})
