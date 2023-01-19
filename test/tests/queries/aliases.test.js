describe('graphql - aliases', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with aliases without connections', () => {
    test('query with alias on service', async () => {
      const query = gql`
        {
          myAlias: AdminServiceBasic {
            Books {
              title
            }
          }
        }
      `
      const data = {
        myAlias: {
          Books: [
            { title: 'Wuthering Heights' },
            { title: 'Jane Eyre' },
            { title: 'The Raven' },
            { title: 'Eleonora' },
            { title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on entity', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            myAlias: Books {
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          myAlias: [
            { title: 'Wuthering Heights' },
            { title: 'Jane Eyre' },
            { title: 'The Raven' },
            { title: 'Eleonora' },
            { title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on element', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              myAlias: title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { myAlias: 'Wuthering Heights' },
            { myAlias: 'Jane Eyre' },
            { myAlias: 'The Raven' },
            { myAlias: 'Eleonora' },
            { myAlias: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on association', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              myAlias: author {
                name
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { myAlias: { name: 'Emily Brontë' } },
            { myAlias: { name: 'Charlotte Brontë' } },
            { myAlias: { name: 'Edgar Allen Poe' } },
            { myAlias: { name: 'Edgar Allen Poe' } },
            { myAlias: { name: 'Richard Carpenter' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on element of association', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              author {
                myAlias: name
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { author: { myAlias: 'Emily Brontë' } },
            { author: { myAlias: 'Charlotte Brontë' } },
            { author: { myAlias: 'Edgar Allen Poe' } },
            { author: { myAlias: 'Edgar Allen Poe' } },
            { author: { myAlias: 'Richard Carpenter' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on all fields', async () => {
      const query = gql`
        {
          myAliasA: AdminServiceBasic {
            myAliasB: Books {
              myAliasC: author {
                myAliasD: name
              }
            }
          }
        }
      `
      const data = {
        myAliasA: {
          myAliasB: [
            { myAliasC: { myAliasD: 'Emily Brontë' } },
            { myAliasC: { myAliasD: 'Charlotte Brontë' } },
            { myAliasC: { myAliasD: 'Edgar Allen Poe' } },
            { myAliasC: { myAliasD: 'Edgar Allen Poe' } },
            { myAliasC: { myAliasD: 'Richard Carpenter' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on entity selecting different fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            myAliasA: Books {
              ID
            }
            myAliasB: Books {
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          myAliasA: [{ ID: 201 }, { ID: 207 }, { ID: 251 }, { ID: 252 }, { ID: 271 }],
          myAliasB: [
            { title: 'Wuthering Heights' },
            { title: 'Jane Eyre' },
            { title: 'The Raven' },
            { title: 'Eleonora' },
            { title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    // REVISIT: aliases with expand currently not supported in cds
    test.skip('query with aliases on to-many element selecting different fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors {
              myAliasA: books {
                ID
                title
              }
              myAliasB: books {
                ID
                stock
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            {
              myAliasA: [{ ID: 201, title: 'Wuthering Heights' }],
              myAliasB: [{ ID: 201, stock: 12 }]
            },
            {
              myAliasA: [{ ID: 207, title: 'Jane Eyre' }],
              myAliasB: [{ ID: 207, stock: 11 }]
            },
            {
              myAliasA: [
                { ID: 251, title: 'The Raven' },
                { ID: 252, title: 'Eleonora' }
              ],
              myAliasB: [
                { ID: 251, stock: 333 },
                { ID: 252, stock: 555 }
              ]
            },
            {
              myAliasA: [{ ID: 271, title: 'Catweazle' }],
              myAliasB: [{ ID: 271, stock: 22 }]
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    // REVISIT: aliases with expand currently not supported in cds
    test.skip('query with aliases on to-many element with different filters selecting different fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors {
              myAliasA: books(filter: { ID: { le: 251 } }) {
                ID
                title
              }
              myAliasB: books(filter: { ID: { gt: 251 } }) {
                ID
                stock
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            {
              myAliasA: [{ ID: 201, title: 'Wuthering Heights' }]
            },
            {
              myAliasA: [{ ID: 207, title: 'Jane Eyre' }]
            },
            {
              myAliasA: [{ ID: 251, title: 'The Raven' }],
              myAliasB: [{ ID: 252, stock: 555 }]
            },
            {
              myAliasA: [],
              myAliasB: [{ ID: 271, stock: 22 }]
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on service allowing two different filters on the same field', async () => {
      const query = gql`
        {
          myAliasA: AdminServiceBasic {
            Books(filter: { ID: { eq: 201 } }) {
              ID
              title
            }
          }
          myAliasB: AdminServiceBasic {
            Books(filter: { ID: { eq: 207 } }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        myAliasA: {
          Books: [{ ID: 201, title: 'Wuthering Heights' }]
        },
        myAliasB: {
          Books: [{ ID: 207, title: 'Jane Eyre' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on entity allowing two different filters on the same field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            myAliasA: Books(filter: { ID: { eq: 201 } }) {
              ID
              title
            }
          }
          AdminServiceBasic {
            myAliasB: Books(filter: { ID: { eq: 207 } }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          myAliasA: [{ ID: 201, title: 'Wuthering Heights' }],
          myAliasB: [{ ID: 207, title: 'Jane Eyre' }]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with aliases with connections', () => {
    test('query with alias on service', async () => {
      const query = gql`
        {
          myAlias: AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        myAlias: {
          Books: {
            nodes: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on entity', async () => {
      const query = gql`
        {
          AdminService {
            myAlias: Books {
              nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          myAlias: {
            nodes: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on nodes of entity', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              myAlias: nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            myAlias: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on element', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                myAlias: title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { myAlias: 'Wuthering Heights' },
              { myAlias: 'Jane Eyre' },
              { myAlias: 'The Raven' },
              { myAlias: 'Eleonora' },
              { myAlias: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on association', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                myAlias: author {
                  name
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
              { myAlias: { name: 'Emily Brontë' } },
              { myAlias: { name: 'Charlotte Brontë' } },
              { myAlias: { name: 'Edgar Allen Poe' } },
              { myAlias: { name: 'Edgar Allen Poe' } },
              { myAlias: { name: 'Richard Carpenter' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with alias on element of association', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                author {
                  myAlias: name
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
              { author: { myAlias: 'Emily Brontë' } },
              { author: { myAlias: 'Charlotte Brontë' } },
              { author: { myAlias: 'Edgar Allen Poe' } },
              { author: { myAlias: 'Edgar Allen Poe' } },
              { author: { myAlias: 'Richard Carpenter' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on all fields', async () => {
      const query = gql`
        {
          myAliasA: AdminService {
            myAliasB: Books {
              myAliasC: nodes {
                myAliasD: author {
                  myAliasE: name
                }
              }
            }
          }
        }
      `
      const data = {
        myAliasA: {
          myAliasB: {
            myAliasC: [
              { myAliasD: { myAliasE: 'Emily Brontë' } },
              { myAliasD: { myAliasE: 'Charlotte Brontë' } },
              { myAliasD: { myAliasE: 'Edgar Allen Poe' } },
              { myAliasD: { myAliasE: 'Edgar Allen Poe' } },
              { myAliasD: { myAliasE: 'Richard Carpenter' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on entity selecting different fields', async () => {
      const query = gql`
        {
          AdminService {
            myAliasA: Books {
              nodes {
                ID
              }
            }
            myAliasB: Books {
              nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          myAliasA: { nodes: [{ ID: 201 }, { ID: 207 }, { ID: 251 }, { ID: 252 }, { ID: 271 }] },
          myAliasB: {
            nodes: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    // REVISIT: aliases with expand currently not supported in cds
    test.skip('query with aliases on to-many element selecting different fields', async () => {
      const query = gql`
        {
          AdminService {
            Authors {
              myAliasA: books {
                nodes {
                  ID
                  title
                }
              }
              myAliasB: books {
                nodes {
                  ID
                  stock
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: [
            {
              myAliasA: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] },
              myAliasB: { nodes: [{ ID: 201, stock: 12 }] }
            },
            {
              myAliasA: { nodes: [{ ID: 207, title: 'Jane Eyre' }] },
              myAliasB: { nodes: [{ ID: 207, stock: 11 }] }
            },
            {
              myAliasA: {
                nodes: [
                  { ID: 251, title: 'The Raven' },
                  { ID: 252, title: 'Eleonora' }
                ]
              },
              myAliasB: {
                nodes: [
                  { ID: 251, stock: 333 },
                  { ID: 252, stock: 555 }
                ]
              }
            },
            {
              myAliasA: { nodes: [{ ID: 271, title: 'Catweazle' }] },
              myAliasB: { nodes: [{ ID: 271, stock: 22 }] }
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    // REVISIT: aliases with expand currently not supported in cds
    test.skip('query with aliases on to-many element with different filters selecting different fields', async () => {
      const query = gql`
        {
          AdminService {
            Authors {
              myAliasA: books(filter: { ID: { le: 251 } }) {
                nodes {
                  ID
                  title
                }
              }
              myAliasB: books(filter: { ID: { gt: 251 } }) {
                nodes {
                  ID
                  stock
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: [
            {
              myAliasA: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] },
              myAliasB: { nodes: [] }
            },
            {
              myAliasA: { nodes: [{ ID: 207, title: 'Jane Eyre' }] },
              myAliasB: { nodes: [] }
            },
            {
              myAliasA: { nodes: [{ ID: 251, title: 'The Raven' }] },
              myAliasB: { nodes: [{ ID: 252, stock: 555 }] }
            },
            {
              myAliasA: { nodes: [] },
              myAliasB: { nodes: [{ ID: 271, stock: 22 }] }
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on service allowing two different filters on the same field', async () => {
      const query = gql`
        {
          myAliasA: AdminService {
            Books(filter: { ID: { eq: 201 } }) {
              nodes {
                ID
                title
              }
            }
          }
          myAliasB: AdminService {
            Books(filter: { ID: { eq: 207 } }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const data = {
        myAliasA: {
          Books: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] }
        },
        myAliasB: {
          Books: { nodes: [{ ID: 207, title: 'Jane Eyre' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on entity allowing two different filters on the same field', async () => {
      const query = gql`
        {
          AdminService {
            myAliasA: Books(filter: { ID: { eq: 201 } }) {
              nodes {
                ID
                title
              }
            }
          }
          AdminService {
            myAliasB: Books(filter: { ID: { eq: 207 } }) {
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
          myAliasA: { nodes: [{ ID: 201, title: 'Wuthering Heights' }] },
          myAliasB: { nodes: [{ ID: 207, title: 'Jane Eyre' }] }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on nodes returning the same result list twice', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              myAliasA: nodes {
                title
              }
              myAliasB: nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            myAliasA: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ],
            myAliasB: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with aliases on nodes returning different fields', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              myAliasA: nodes {
                ID
              }
              myAliasB: nodes {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            myAliasA: [{ ID: 201 }, { ID: 207 }, { ID: 251 }, { ID: 252 }, { ID: 271 }],
            myAliasB: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
