describe('graphql - cds.request', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/cds.Request'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('HTTP request headers are correctly passed to custom handlers', () => {
    const my_header = 'my header value'

    test('Create', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              create(input: {}) {
                my_header
              }
            }
          }
        }
      `
      const data = {
        RequestService: {
          A: {
            create: [{ my_header }]
          }
        }
      }
      const response = await POST('/graphql', { query }, { headers: { my_header } })
      expect(response.data).toEqual({ data })
    })

    test('Read', async () => {
      const query = gql`
        {
          RequestService {
            A {
              nodes {
                my_header
              }
            }
          }
        }
      `
      const data = {
        RequestService: {
          A: {
            nodes: [{ my_header }]
          }
        }
      }
      const response = await POST('/graphql', { query }, { headers: { my_header } })
      expect(response.data).toEqual({ data })
    })

    test('Update', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              update(filter: [], input: {}) {
                my_header
              }
            }
          }
        }
      `
      const data = {
        RequestService: {
          A: {
            update: [{ my_header }]
          }
        }
      }
      const response = await POST('/graphql', { query }, { headers: { my_header } })
      expect(response.data).toEqual({ data })
    })

    test('Delete', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              delete(filter: [])
            }
          }
        }
      `
      const data = {
        RequestService: {
          A: {
            delete: 999
          }
        }
      }
      const response = await POST('/graphql', { query }, { headers: { my_header } })
      expect(response.data).toEqual({ data })
    })
  })

  describe('HTTP response headers are correctly set in custom handlers', () => {
    const my_res_header = 'my res header value'

    test('Create', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              create(input: {}) {
                id
              }
            }
          }
        }
      `
      const response = await POST('/graphql', { query })
      expect(response.headers).toMatchObject({ my_res_header })
    })

    test('Read', async () => {
      const query = gql`
        {
          RequestService {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST('/graphql', { query })
      expect(response.headers).toMatchObject({ my_res_header })
    })

    test('Update', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              update(filter: [], input: {}) {
                id
              }
            }
          }
        }
      `
      const response = await POST('/graphql', { query })
      expect(response.headers).toMatchObject({ my_res_header })
    })

    test('Delete', async () => {
      const query = gql`
        mutation {
          RequestService {
            A {
              delete(filter: [])
            }
          }
        }
      `
      const response = await POST('/graphql', { query })
      expect(response.headers).toMatchObject({ my_res_header })
    })
  })
})
