describe('graphql - meta fields', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with __typename meta field without connections', () => {
    test('query with __typename meta field on root query', async () => {
      const query = gql`
        {
          __typename
        }
      `
      const data = { __typename: 'Query' }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on service', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            __typename
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          __typename: 'AdminServiceBasic'
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on entity', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              __typename
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { __typename: 'AdminServiceBasic_Books' },
            { __typename: 'AdminServiceBasic_Books' },
            { __typename: 'AdminServiceBasic_Books' },
            { __typename: 'AdminServiceBasic_Books' },
            { __typename: 'AdminServiceBasic_Books' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on association of entity', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              author {
                __typename
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { author: { __typename: 'AdminServiceBasic_Authors' } },
            { author: { __typename: 'AdminServiceBasic_Authors' } },
            { author: { __typename: 'AdminServiceBasic_Authors' } },
            { author: { __typename: 'AdminServiceBasic_Authors' } },
            { author: { __typename: 'AdminServiceBasic_Authors' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on all nesting levels', async () => {
      const query = gql`
        {
          __typename
          AdminServiceBasic {
            __typename
            Books {
              __typename
              author {
                __typename
                name
              }
            }
          }
        }
      `
      const data = {
        __typename: 'Query',
        AdminServiceBasic: {
          __typename: 'AdminServiceBasic',
          Books: [
            {
              __typename: 'AdminServiceBasic_Books',
              author: { __typename: 'AdminServiceBasic_Authors', name: 'Emily Brontë' }
            },
            {
              __typename: 'AdminServiceBasic_Books',
              author: { __typename: 'AdminServiceBasic_Authors', name: 'Charlotte Brontë' }
            },
            {
              __typename: 'AdminServiceBasic_Books',
              author: { __typename: 'AdminServiceBasic_Authors', name: 'Edgar Allen Poe' }
            },
            {
              __typename: 'AdminServiceBasic_Books',
              author: { __typename: 'AdminServiceBasic_Authors', name: 'Edgar Allen Poe' }
            },
            {
              __typename: 'AdminServiceBasic_Books',
              author: { __typename: 'AdminServiceBasic_Authors', name: 'Richard Carpenter' }
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with __typename meta field with connections', () => {
    test('query with __typename meta field on root query', async () => {
      const query = gql`
        {
          __typename
        }
      `
      const data = { __typename: 'Query' }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on service', async () => {
      const query = gql`
        {
          AdminService {
            __typename
          }
        }
      `
      const data = {
        AdminService: {
          __typename: 'AdminService'
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on entity', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              __typename
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: { __typename: 'AdminService_Books_connection' }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on entity nodes', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                __typename
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { __typename: 'AdminService_Books' },
              { __typename: 'AdminService_Books' },
              { __typename: 'AdminService_Books' },
              { __typename: 'AdminService_Books' },
              { __typename: 'AdminService_Books' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on association of entity', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                author {
                  __typename
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { author: { __typename: 'AdminService_Authors' } },
              { author: { __typename: 'AdminService_Authors' } },
              { author: { __typename: 'AdminService_Authors' } },
              { author: { __typename: 'AdminService_Authors' } },
              { author: { __typename: 'AdminService_Authors' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with __typename meta field on all nesting levels', async () => {
      const query = gql`
        {
          __typename
          AdminService {
            __typename
            Books {
              __typename
              nodes {
                __typename
                author {
                  __typename
                  name
                }
              }
            }
          }
        }
      `
      const data = {
        __typename: 'Query',
        AdminService: {
          __typename: 'AdminService',
          Books: {
            __typename: 'AdminService_Books_connection',
            nodes: [
              {
                __typename: 'AdminService_Books',
                author: { __typename: 'AdminService_Authors', name: 'Emily Brontë' }
              },
              {
                __typename: 'AdminService_Books',
                author: { __typename: 'AdminService_Authors', name: 'Charlotte Brontë' }
              },
              {
                __typename: 'AdminService_Books',
                author: { __typename: 'AdminService_Authors', name: 'Edgar Allen Poe' }
              },
              {
                __typename: 'AdminService_Books',
                author: { __typename: 'AdminService_Authors', name: 'Edgar Allen Poe' }
              },
              {
                __typename: 'AdminService_Books',
                author: { __typename: 'AdminService_Authors', name: 'Richard Carpenter' }
              }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
