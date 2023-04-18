describe('graphql - custom handlers', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/custom-handlers'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('Handling of different return types returned by custom handlers', () => {
    const id = '0557a188-326e-4dcb-999b-e1acf7979fa3'
    const string = 'foo'

    test('Integer, String, Object, and Array returned for CREATE custom handler', async () => {
      const query = gql`
        mutation {
          ReturnTypesService {
            Integer {
              create(input: {}) {
                id
                string
              }
            }
            String {
              create(input: {}) {
                id
                string
              }
            }
            Object {
              create(input: {}) {
                id
                string
              }
            }
            Array {
              create(input: {}) {
                id
                string
              }
            }
          }
        }
      `
      const data = {
        ReturnTypesService: {
          Integer: {
            create: null
          },
          String: {
            create: null
          },
          Object: {
            create: [{ id, string }]
          },
          Array: {
            create: [
              { id, string },
              { id, string }
            ]
          }
        }
      }
      const errors = [
        {
          locations: [{ column: 15, line: 5 }],
          message: 'Expected Iterable, but did not find one for field "ReturnTypesService_Integer_input.create".',
          path: ['ReturnTypesService', 'Integer', 'create']
        },
        {
          locations: [{ column: 15, line: 11 }],
          message: 'Expected Iterable, but did not find one for field "ReturnTypesService_String_input.create".',
          path: ['ReturnTypesService', 'String', 'create']
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data, errors })
    })

    test('Integer, String, Object, and Array returned for READ custom handler', async () => {
      const query = gql`
        query {
          ReturnTypesService {
            Integer {
              nodes {
                id
                string
              }
            }
            String {
              nodes {
                id
                string
              }
            }
            Object {
              nodes {
                id
                string
              }
            }
            Array {
              nodes {
                id
                string
              }
            }
          }
        }
      `
      const data = {
        ReturnTypesService: {
          Integer: {
            nodes: null
          },
          String: {
            nodes: null
          },
          Object: {
            nodes: [{ id, string }]
          },
          Array: {
            nodes: [
              { id, string },
              { id, string }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('Integer, String, Object, and Array returned for UPDATE custom handler', async () => {
      const query = gql`
        mutation {
          ReturnTypesService {
            Integer {
              update(filter: [], input: {}) {
                id
                string
              }
            }
            String {
              update(filter: [], input: {}) {
                id
                string
              }
            }
            Object {
              update(filter: [], input: {}) {
                id
                string
              }
            }
            Array {
              update(filter: [], input: {}) {
                id
                string
              }
            }
          }
        }
      `
      const data = {
        ReturnTypesService: {
          Integer: {
            update: null
          },
          String: {
            update: null
          },
          Object: {
            update: [{ id, string }]
          },
          Array: {
            update: [
              { id, string },
              { id, string }
            ]
          }
        }
      }
      const errors = [
        {
          locations: [{ column: 15, line: 5 }],
          message: 'Expected Iterable, but did not find one for field "ReturnTypesService_Integer_input.update".',
          path: ['ReturnTypesService', 'Integer', 'update']
        },
        {
          locations: [{ column: 15, line: 11 }],
          message: 'Expected Iterable, but did not find one for field "ReturnTypesService_String_input.update".',
          path: ['ReturnTypesService', 'String', 'update']
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data, errors })
    })

    test('Integer, String, Object, and Array returned for DELETE custom handler', async () => {
      const query = gql`
        mutation {
          ReturnTypesService {
            Integer {
              delete(filter: [])
            }
            String {
              delete(filter: [])
            }
            Object {
              delete(filter: [])
            }
            Array {
              delete(filter: [])
            }
          }
        }
      `
      const data = {
        ReturnTypesService: {
          Integer: {
            delete: 999
          },
          String: {
            delete: null
          },
          Object: {
            delete: 1
          },
          Array: {
            delete: 2
          }
        }
      }
      const errors = [
        {
          locations: [{ column: 15, line: 8 }],
          message: 'Int cannot represent non-integer value: "foo"',
          path: ['ReturnTypesService', 'String', 'delete']
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data, errors })
    })
  })
})
