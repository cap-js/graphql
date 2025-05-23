let counter = 0

module.exports = srv => {
  srv.on('getCounter', async () => counter)
  srv.on('incCounter', async () => ++counter)
  srv.on('decCounter', async () => --counter)
}
