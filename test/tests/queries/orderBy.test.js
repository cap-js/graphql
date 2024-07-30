describe('graphql - orderBy', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with orderBy argument without connections', () => {
    test('query with single orderBy object on field', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books(orderBy: { ID: desc }) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 271, title: 'Catweazle' },
            { ID: 252, title: 'Eleonora' },
            { ID: 251, title: 'The Raven' },
            { ID: 207, title: 'Jane Eyre' },
            { ID: 201, title: 'Wuthering Heights' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with list of orderBy object on field', async () => {
      // Use createdAt as first sort criteria to test second level sort criteria,
      // since they all have the same values due to being created at the same time
      const query = gql`
        {
          AdminServiceBasic {
            Books(orderBy: [{ createdAt: desc }, { ID: desc }]) {
              ID
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 271, title: 'Catweazle' },
            { ID: 252, title: 'Eleonora' },
            { ID: 251, title: 'The Raven' },
            { ID: 207, title: 'Jane Eyre' },
            { ID: 201, title: 'Wuthering Heights' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with orderBy objects on nested fields', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors(orderBy: { ID: desc }) {
              ID
              books(orderBy: { title: desc }) {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            { ID: 170, books: [{ title: 'Catweazle' }] },
            { ID: 150, books: [{ title: 'The Raven' }, { title: 'Eleonora' }] },
            { ID: 107, books: [{ title: 'Jane Eyre' }] },
            { ID: 101, books: [{ title: 'Wuthering Heights' }] }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with orderBy argument with connections', () => {
    test('query with single orderBy object on field', async () => {
      const query = gql`
        {
          AdminService {
            Books(orderBy: { ID: desc }) {
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
              { ID: 271, title: 'Catweazle' },
              { ID: 252, title: 'Eleonora' },
              { ID: 251, title: 'The Raven' },
              { ID: 207, title: 'Jane Eyre' },
              { ID: 201, title: 'Wuthering Heights' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with list of orderBy object on field', async () => {
      // Use createdAt as first sort criteria to test second level sort criteria,
      // since they all have the same values due to being created at the same time
      const query = gql`
        {
          AdminService {
            Books(orderBy: [{ createdAt: desc }, { ID: desc }]) {
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
              { ID: 271, title: 'Catweazle' },
              { ID: 252, title: 'Eleonora' },
              { ID: 251, title: 'The Raven' },
              { ID: 207, title: 'Jane Eyre' },
              { ID: 201, title: 'Wuthering Heights' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with orderBy objects on nested fields', async () => {
      const query = gql`
        {
          AdminService {
            Authors(orderBy: { ID: desc }) {
              nodes {
                ID
                books(orderBy: { title: desc }) {
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
              { ID: 170, books: { nodes: [{ title: 'Catweazle' }] } },
              { ID: 150, books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] } },
              { ID: 107, books: { nodes: [{ title: 'Jane Eyre' }] } },
              { ID: 101, books: { nodes: [{ title: 'Wuthering Heights' }] } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
