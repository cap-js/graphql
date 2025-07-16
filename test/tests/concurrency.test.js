describe('graphql - resolver concurrency', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/concurrency'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('execution order of query and mutation resolvers', () => {

    let _log = []

    beforeEach(() => {
      console.log = s => _log.push(s) // eslint-disable-line no-console
    })

    afterEach(() => {
      _log = []
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
      expect(_log[0]).toEqual('BEGIN READ A')
      expect(_log[1]).toEqual('BEGIN READ B')
      expect(_log[2]).toEqual('BEGIN READ C')
      expect(_log[3]).toEqual('END READ B')
      expect(_log[4]).toEqual('END READ C')
      expect(_log[5]).toEqual('END READ A')
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
      expect(_log[0]).toEqual('BEGIN CREATE A')
      expect(_log[1]).toEqual('END CREATE A')
      expect(_log[2]).toEqual('BEGIN CREATE B')
      expect(_log[3]).toEqual('END CREATE B')
      expect(_log[4]).toEqual('BEGIN CREATE C')
      expect(_log[5]).toEqual('END CREATE C')
    })
  })

  describe('queries and mutations returning data and errors', () => {
    test('query resolvers return both data and an error', async () => {
      const query = gql`
        query {
          DataAndErrorsService {
            A {
              nodes {
                timestamp
              }
            }
            B {
              nodes {
                timestamp
              }
            }
            C {
              nodes {
                timestamp
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'My error on READ B',
          locations: [
            {
              line: 9,
              column: 13
            }
          ],
          path: ['DataAndErrorsService', 'B'],
          extensions: expect.any(Object)
        }
      ]
      const data = {
        DataAndErrorsService: {
          A: {
            nodes: [
              {
                timestamp: expect.any(String)
              }
            ]
          },
          B: null,
          C: {
            nodes: [
              {
                timestamp: expect.any(String)
              }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ errors, data })
      // A sleeps 3000 ms, C sleeps 2000 ms
      // Since query resolvers are executed in parallel C should resolve before A
      expect(new Date(response.data.data.DataAndErrorsService.A.nodes[0].timestamp).getTime()).toBeGreaterThan(
        new Date(response.data.data.DataAndErrorsService.C.nodes[0].timestamp).getTime()
      )
    })

    test('mutation resolvers return both data and an error', async () => {
      const query = gql`
        mutation {
          DataAndErrorsService {
            A {
              create(input: {}) {
                timestamp
              }
            }
            B {
              create(input: {}) {
                timestamp
              }
            }
            C {
              create(input: {}) {
                timestamp
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'My error on CREATE B',
          locations: [
            {
              line: 10,
              column: 15
            }
          ],
          path: ['DataAndErrorsService', 'B', 'create'],
          extensions: expect.any(Object)
        }
      ]
      const data = {
        DataAndErrorsService: {
          A: {
            create: [
              {
                timestamp: expect.any(String)
              }
            ]
          },
          B: {
            create: null
          },
          C: {
            create: [
              {
                timestamp: expect.any(String)
              }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ errors, data })
      // A sleeps 3000 ms, C sleeps 2000 ms
      // Since mutation resolvers are executed serially A should resolve before C
      expect(new Date(response.data.data.DataAndErrorsService.A.create[0].timestamp).getTime()).toBeLessThan(
        new Date(response.data.data.DataAndErrorsService.C.create[0].timestamp).getTime()
      )
    })
  })
})
