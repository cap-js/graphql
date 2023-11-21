
const cds = require('@sap/cds')
const util = require('util')
const sleep = util.promisify(setTimeout)

class DataAndErrorsService extends cds.ApplicationService { init(){

  const SLEEP_DURATION_A = 300
  const SLEEP_DURATION_B = 100
  const SLEEP_DURATION_C = 200

  this.on('READ', 'A', async () => {
    await sleep(SLEEP_DURATION_A)
    return [{ timestamp: new Date().toISOString() }]
  })
  this.on('READ', 'B', async () => {
    await sleep(SLEEP_DURATION_B)
    throw 'My error on READ B'
  })
  this.on('READ', 'C', async () => {
    await sleep(SLEEP_DURATION_C)
    return [{ timestamp: new Date().toISOString() }]
  })

  this.on('CREATE', 'A', async () => {
    await sleep(SLEEP_DURATION_A)
    return [{ timestamp: new Date().toISOString() }]
  })
  this.on('CREATE', 'B', async () => {
    await sleep(SLEEP_DURATION_B)
    throw new Error('My error on CREATE B')
  })
  this.on('CREATE', 'C', async () => {
    await sleep(SLEEP_DURATION_C)
    return [{ timestamp: new Date().toISOString() }]
  })

  return super.init()
}}

module.exports = { DataAndErrorsService }