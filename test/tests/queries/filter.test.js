describe('graphql - filter', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with filter argument without connections', () => {
    test('query with simple filter', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: { ID: { eq: 201 } }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [{ ID: 201, title: 'Wuthering Heights' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with simple filter wrapped as lists', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: [{ ID: [{ eq: 201 }] }]) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [{ ID: 201, title: 'Wuthering Heights' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by AND on the same field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: { ID: { gt: 250, lt: 260 } }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by AND on different fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: { ID: { eq: 251 }, title: { eq: "The Raven" } }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [{ ID: 251, title: 'The Raven' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by OR on the same field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: { ID: [{ eq: 201 }, { eq: 251 }] }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 201, title: 'Wuthering Heights' },
            { ID: 251, title: 'The Raven' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by OR on different fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(filter: [{ ID: { eq: 201 } }, { title: { eq: "The Raven" } }]) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 201, title: 'Wuthering Heights' },
            { ID: 251, title: 'The Raven' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with complex filter', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(
              filter: [
                {
                  title: [{ startswith: "the", endswith: "raven" }, { contains: "height" }]
                  ID: [{ eq: 201 }, { eq: 251 }]
                }
                { title: { contains: "cat" } }
              ]
            ) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 201, title: 'Wuthering Heights' },
            { ID: 251, title: 'The Raven' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filters on nested fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors(filter: { ID: { gt: 110 } }) {
              ID
              name
              books(filter: { ID: { lt: 260 } }) {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            {
              ID: 150,
              books: [
                { ID: 251, title: 'The Raven' },
                { ID: 252, title: 'Eleonora' }
              ],
              name: 'Edgar Allen Poe'
            },
            { ID: 170, books: [], name: 'Richard Carpenter' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with filter argument with connections', () => {
    test('query with simple filter', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: { eq: 201 } }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with simple filter wrapped as lists', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: [{ ID: [{ eq: 201 }] }]) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by AND on the same field', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: { gt: 250, lt: 260 } }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by AND on different fields', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: { eq: 251 }, title: { eq: "The Raven" } }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: { nodes: [{ ID: 251, title: 'The Raven' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by OR on the same field', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: [{ eq: 201 }, { eq: 251 }] }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 201, title: 'Wuthering Heights' },
              { ID: 251, title: 'The Raven' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filter joined by OR on different fields', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: [{ ID: { eq: 201 } }, { title: { eq: "The Raven" } }]) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 201, title: 'Wuthering Heights' },
              { ID: 251, title: 'The Raven' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with complex filter', async () => {
      const query = gql`
        {
          AdminService {
            Books(
              filter: [
                {
                  title: [{ startswith: "the", endswith: "raven" }, { contains: "height" }]
                  ID: [{ eq: 201 }, { eq: 251 }]
                }
                { title: { contains: "cat" } }
              ]
            ) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 201, title: 'Wuthering Heights' },
              { ID: 251, title: 'The Raven' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with filters on nested fields', async () => {
      const query = gql`
        {
          AdminService {
            Authors(filter: { ID: { gt: 110 } }) {
              nodes {
                ID
                name
                books(filter: { ID: { lt: 260 } }) {
                  nodes {
                    ID
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
                ID: 150,
                books: {
                  nodes: [
                    { ID: 251, title: 'The Raven' },
                    { ID: 252, title: 'Eleonora' }
                  ]
                },
                name: 'Edgar Allen Poe'
              },
              { ID: 170, books: { nodes: [] }, name: 'Richard Carpenter' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
