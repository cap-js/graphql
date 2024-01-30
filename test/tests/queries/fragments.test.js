describe('graphql - fragments', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with fragments without connections', () => {
    test('query with fragment on root query', async () => {
      const query = gql`
        query {
          ...myFragment
        }

        fragment myFragment on Query {
          AdminServiceBasic {
            Books {
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
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

    test('query with fragment on service', async () => {
      const query = gql`
        query {
          AdminServiceBasic {
            ...myFragment
          }
        }

        fragment myFragment on AdminServiceBasic {
          Books {
            title
          }
        }
      `
      const data = {
        AdminServiceBasic: {
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

    test('query with fragment on entity', async () => {
      const query = gql`
        query {
          AdminServiceBasic {
            Books {
              ...myFragment
            }
          }
        }

        fragment myFragment on AdminServiceBasic_Books {
          title
        }
      `
      const data = {
        AdminServiceBasic: {
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

    test('query with nested fragments', async () => {
      const query = gql`
        query {
          ...myFragmentA
        }

        fragment myFragmentA on Query {
          AdminServiceBasic {
            ...myFragmentB
          }
        }

        fragment myFragmentB on AdminServiceBasic {
          Books {
            ...myFragmentC
          }
        }

        fragment myFragmentC on AdminServiceBasic_Books {
          title
        }
      `
      const data = {
        AdminServiceBasic: {
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

    test('query with fragments along with other fields', async () => {
      const query = gql`
        query {
          AdminServiceBasic {
            Books {
              ...myFragmentA
              title
              ...myFragmentB
            }
          }
        }

        fragment myFragmentA on AdminServiceBasic_Books {
          ID
        }

        fragment myFragmentB on AdminServiceBasic_Books {
          author {
            name
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 201, title: 'Wuthering Heights', author: { name: 'Emily Brontë' } },
            { ID: 207, title: 'Jane Eyre', author: { name: 'Charlotte Brontë' } },
            { ID: 251, title: 'The Raven', author: { name: 'Edgar Allen Poe' } },
            { ID: 252, title: 'Eleonora', author: { name: 'Edgar Allen Poe' } },
            { ID: 271, title: 'Catweazle', author: { name: 'Richard Carpenter' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with fragments with connections', () => {
    test('query with fragment on root query', async () => {
      const query = gql`
        query {
          ...myFragment
        }

        fragment myFragment on Query {
          AdminService {
            Books {
              nodes {
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

    test('query with fragment on service', async () => {
      const query = gql`
        query {
          AdminService {
            ...myFragment
          }
        }

        fragment myFragment on AdminService {
          Books {
            nodes {
              title
            }
          }
        }
      `
      const data = {
        AdminService: {
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

    test('query with fragment on entity', async () => {
      const query = gql`
        query {
          AdminService {
            Books {
              ...myFragment
            }
          }
        }

        fragment myFragment on AdminService_Books_connection {
          nodes {
            title
          }
        }
      `
      const data = {
        AdminService: {
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

    test('query with fragment on nodes of entity', async () => {
      const query = gql`
        query {
          AdminService {
            Books {
              nodes {
                ...myFragment
              }
            }
          }
        }

        fragment myFragment on AdminService_Books {
          title
        }
      `
      const data = {
        AdminService: {
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

    test('query with nested fragments', async () => {
      const query = gql`
        query {
          ...myFragmentA
        }

        fragment myFragmentA on Query {
          AdminService {
            ...myFragmentB
          }
        }

        fragment myFragmentB on AdminService {
          Books {
            ...myFragmentC
          }
        }

        fragment myFragmentC on AdminService_Books_connection {
          nodes {
            ...myFragmentD
          }
        }

        fragment myFragmentD on AdminService_Books {
          title
        }
      `
      const data = {
        AdminService: {
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

    test('query with fragment containing multiple scalar fields', async () => {
      const query = gql`
        query {
          AdminService {
            Books {
              nodes {
                ...myFragmentA
              }
            }
          }
        }

        fragment myFragmentA on AdminService_Books {
          ID
          title
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 201, title: 'Wuthering Heights' },
              { ID: 207, title: 'Jane Eyre' },
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with fragments along with other fields', async () => {
      const query = gql`
        query {
          AdminService {
            Books {
              nodes {
                ...myFragmentA
                title
                ...myFragmentB
              }
            }
          }
        }

        fragment myFragmentA on AdminService_Books {
          ID
        }

        fragment myFragmentB on AdminService_Books {
          author {
            name
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 201, title: 'Wuthering Heights', author: { name: 'Emily Brontë' } },
              { ID: 207, title: 'Jane Eyre', author: { name: 'Charlotte Brontë' } },
              { ID: 251, title: 'The Raven', author: { name: 'Edgar Allen Poe' } },
              { ID: 252, title: 'Eleonora', author: { name: 'Edgar Allen Poe' } },
              { ID: 271, title: 'Catweazle', author: { name: 'Richard Carpenter' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
