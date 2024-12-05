describe('graphql - offset-based paging', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  axios.defaults.headers = {
    authorization: 'Basic YWxpY2U6'
  }

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with paging arguments without connections', () => {
    test('query with top argument on field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors(top: 2) {
              name
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [{ name: 'Emily Brontë' }, { name: 'Charlotte Brontë' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with top and skip arguments on field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors(top: 2, skip: 2) {
              name
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [{ name: 'Edgar Allen Poe' }, { name: 'Richard Carpenter' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with top and skip arguments on nested fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors(top: 2, skip: 2) {
              name
              books(top: 1, skip: 1) {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: [
            {
              name: 'Edgar Allen Poe',
              books: [
                // Edgar Allen Poe has 2 books, but only 1 requested.
                {
                  title: 'Eleonora'
                }
              ]
            },
            {
              name: 'Richard Carpenter',
              books: []
            }
          ]
        }
      }

      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with paging arguments with connections', () => {
    test('query with top argument on field', async () => {
      const query = gql`
        {
          AdminService {
            Authors(top: 2) {
              nodes {
                name
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: { nodes: [{ name: 'Emily Brontë' }, { name: 'Charlotte Brontë' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with top and skip arguments on field', async () => {
      const query = gql`
        {
          AdminService {
            Authors(top: 2, skip: 2) {
              nodes {
                name
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: { nodes: [{ name: 'Edgar Allen Poe' }, { name: 'Richard Carpenter' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with top and skip arguments on nested fields', async () => {
      const query = gql`
        {
          AdminService {
            Authors(top: 2, skip: 2) {
              nodes {
                name
                books(top: 1, skip: 1) {
                  nodes {
                    title
                  }
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: {
            nodes: [
              {
                name: 'Edgar Allen Poe',
                books: {
                  // Edgar Allen Poe has 2 books, but only 1 requested.
                  nodes: [
                    {
                      title: 'Eleonora'
                    }
                  ]
                }
              },
              {
                name: 'Richard Carpenter',
                books: {
                  nodes: []
                }
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
