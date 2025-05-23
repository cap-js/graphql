let counter = 0

module.exports = srv => {
  srv.on('getCounter', async () => counter)
  srv.on('incCounter', async () => {
    counter++
    await srv.emit('CounterUpdate', { counter })
    return counter
  })
  srv.on('decCounter', async () => {
    counter--
    await srv.emit('CounterUpdate', { counter })
    return counter
  })
}
