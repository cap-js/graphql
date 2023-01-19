describe('graphql resolver concurrency', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { POST } = cds.test(path.join(__dirname, '../resources/concurrency'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  let _log

  beforeEach(() => {
    _log = jest.spyOn(console, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('query resolvers should be executed in parallel', async () => {
    const query = gql`
      query {
        ConcurrencyService {
          A {
            nodes {
              id
            }
          }
          B {
            nodes {
              id
            }
          }
          C {
            nodes {
              id
            }
          }
        }
      }
    `
    await POST('/graphql', { query })
    expect(_log.mock.calls[0][0]).toEqual('BEGIN READ A')
    expect(_log.mock.calls[1][0]).toEqual('BEGIN READ B')
    expect(_log.mock.calls[2][0]).toEqual('BEGIN READ C')
    expect(_log.mock.calls[3][0]).toEqual('END READ B')
    expect(_log.mock.calls[4][0]).toEqual('END READ C')
    expect(_log.mock.calls[5][0]).toEqual('END READ A')
  })

  test('mutation resolvers should be executed serially', async () => {
    const query = gql`
      mutation {
        ConcurrencyService {
          A {
            create(input: {}) {
              id
            }
          }
          B {
            create(input: {}) {
              id
            }
          }
          C {
            create(input: {}) {
              id
            }
          }
        }
      }
    `
    await POST('/graphql', { query })
    expect(_log.mock.calls[0][0]).toEqual('BEGIN CREATE A')
    expect(_log.mock.calls[1][0]).toEqual('END CREATE A')
    expect(_log.mock.calls[2][0]).toEqual('BEGIN CREATE B')
    expect(_log.mock.calls[3][0]).toEqual('END CREATE B')
    expect(_log.mock.calls[4][0]).toEqual('BEGIN CREATE C')
    expect(_log.mock.calls[5][0]).toEqual('END CREATE C')
  })
})
