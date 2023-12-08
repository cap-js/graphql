// FIXME: this should not brake the tests
process.env.CDS_REQUIRES_OUTBOX = true

const config = {
  testTimeout: 10000
}

module.exports = config
