describe('graphql - filter', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset()
  })

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with filter argument without connections', () => {
    describe('regular filters', () => {
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
  })

  describe('queries with filter argument with connections', () => {
    describe('regular filters', () => {
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

      test('query with filter operator conjunction', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { ID: { ne: [201, 207, 251] } }) {
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
                { ID: 252, title: 'Eleonora' },
                { ID: 271, title: 'Catweazle' }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter with in operator with single value', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { ID: { in: 201 } }) {
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
              nodes: [{ ID: 201, title: 'Wuthering Heights' }]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter with in operator with multiple values', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: [{ ID: { in: [201, 251] } }, { title: { contains: "cat" } }]) {
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

      test('query with filter joined by AND on the same field with the same operator', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { title: { contains: ["Wuthering", "Heights"] } }) {
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

    describe('filters containing null values or empty input objects and lists', () => {
      test('query with filter of value null', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: null) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter of value empty input object', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: {}) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter of value empty list', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: []) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: []
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter list containing empty input object', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: [{}]) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of value empty input object', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { ID: {} }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of value empty list', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { ID: [] }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: []
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column list containing empty input object', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { ID: [{}] }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of empty input object, which resolves to true, joined by AND with equality filter', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { title: {}, stock: { eq: 11 } }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [{ title: 'Jane Eyre', stock: 11 }]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of empty list, which resolves to false, joined by AND with equality filter', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: { title: [], stock: { eq: 11 } }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: []
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of empty input object, which resolves to true, joined by OR with equality filter', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: [{ title: {} }, { stock: { eq: 11 } }]) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [
                { title: 'Wuthering Heights', stock: 12 },
                { title: 'Jane Eyre', stock: 11 },
                { title: 'The Raven', stock: 333 },
                { title: 'Eleonora', stock: 555 },
                { title: 'Catweazle', stock: 22 }
              ]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with filter column of empty list, which resolves to false, joined by OR with equality filter', async () => {
        const query = gql`
          {
            AdminService {
              Books(filter: [{ title: [] }, { stock: { eq: 11 } }]) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [{ title: 'Jane Eyre', stock: 11 }]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })

      test('query with equality filter for null values', async () => {
        await INSERT.into('sap.capire.bookshop.Books').entries({ title: 'Moby-Dick' })

        const query = gql`
          {
            AdminService {
              Books(filter: { stock: { eq: null } }) {
                nodes {
                  title
                  stock
                }
              }
            }
          }
        `
        const data = {
          AdminService: {
            Books: {
              nodes: [{ title: 'Moby-Dick', stock: null }]
            }
          }
        }
        const response = await POST('/graphql', { query })
        expect(response.data).toEqual({ data })
      })
    })
  })
})
