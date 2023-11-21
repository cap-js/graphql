
const cds = require('@sap/cds')
const util = require('util')
const sleep = util.promisify(setTimeout)

class ConcurrencyService extends cds.ApplicationService { init(){

  const logSleep = async (duration, message) => {
    console.log('BEGIN ' + message)
    await sleep(duration)
    console.log('END ' + message)
  }

  const SLEEP_DURATION_A = 300
  const SLEEP_DURATION_B = 100
  const SLEEP_DURATION_C = 200

  this.on('READ', 'A', () => logSleep(SLEEP_DURATION_A, 'READ A'))
  this.on('READ', 'B', () => logSleep(SLEEP_DURATION_B, 'READ B'))
  this.on('READ', 'C', () => logSleep(SLEEP_DURATION_C, 'READ C'))

  this.on('CREATE', 'A', () => logSleep(SLEEP_DURATION_A, 'CREATE A'))
  this.on('CREATE', 'B', () => logSleep(SLEEP_DURATION_B, 'CREATE B'))
  this.on('CREATE', 'C', () => logSleep(SLEEP_DURATION_C, 'CREATE C'))

  return super.init()
}}

module.exports = { ConcurrencyService }