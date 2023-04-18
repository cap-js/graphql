describe('graphql - variables', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with variables without connections', () => {
    test('query variable of type input object passed as argument without connections', async () => {
      const query = gql`
        query ($filter: [AdminServiceBasic_Books_filter]) {
          AdminServiceBasic {
            Books(filter: $filter) {
              ID
              title
            }
          }
        }
      `
      const variables = { filter: { ID: { ge: 250 } } }
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as argument wrapped in a list', async () => {
      const query = gql`
        query ($filter: AdminServiceBasic_Books_filter) {
          AdminServiceBasic {
            Books(filter: [$filter]) {
              ID
              title
            }
          }
        }
      `
      const variables = { filter: { ID: { ge: 250 } } }
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as a field of an argument', async () => {
      const query = gql`
        query ($filter: [Int_filter]) {
          AdminServiceBasic {
            Books(filter: { ID: $filter }) {
              ID
              title
            }
          }
        }
      `
      const variables = { filter: { ge: 250 } }
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as a field of an argument wrapped in a list', async () => {
      const query = gql`
        query ($filter: Int_filter) {
          AdminServiceBasic {
            Books(filter: { ID: [$filter] }) {
              ID
              title
            }
          }
        }
      `
      const variables = { filter: { ge: 250 } }
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type scalar value passed as a field of an argument', async () => {
      const query = gql`
        query ($filter: [Int]) {
          AdminServiceBasic {
            Books(filter: { ID: { ge: $filter } }) {
              ID
              title
            }
          }
        }
      `
      const variables = { filter: 250 }
      const data = {
        AdminServiceBasic: {
          Books: [
            { ID: 251, title: 'The Raven' },
            { ID: 252, title: 'Eleonora' },
            { ID: 271, title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries with variables with connections', () => {
    test('query variable of type input object passed as argument', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { ID: { ge: 250 } } }
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as argument wrapped in a list', async () => {
      const query = gql`
        query ($filter: AdminService_Books_filter) {
          AdminService {
            Books(filter: [$filter]) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { ID: { ge: 250 } } }
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as a field of an argument', async () => {
      const query = gql`
        query ($filter: [Int_filter]) {
          AdminService {
            Books(filter: { ID: $filter }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { ge: 250 } }
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type input object passed as a field of an argument wrapped in a list', async () => {
      const query = gql`
        query ($filter: Int_filter) {
          AdminService {
            Books(filter: { ID: [$filter] }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { ge: 250 } }
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable of type scalar value passed as a field of an argument', async () => {
      const query = gql`
        query ($filter: [Int]) {
          AdminService {
            Books(filter: { ID: { ge: $filter } }) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: 250 }
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { ID: 251, title: 'The Raven' },
              { ID: 252, title: 'Eleonora' },
              { ID: 271, title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with undefined value as an argument', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: undefined }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with null value as an argument', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: null }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with undefined value where an object value is expected', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { stock: undefined } }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with null value where an object value is expected', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { stock: null } }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with undefined value as a field of an argument', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: { stock: { eq: undefined } } }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable with null value as a field of an argument', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                title
                stock
              }
            }
          }
        }
      `
      const variables = { filter: { stock: { eq: null } } }
      const data = {
        AdminService: {
          Books: {
            nodes: []
          }
        }
      }
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable combining undefined and non-undefined values', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: [{ ID: { eq: undefined } }, { ID: { eq: 251 } }, { ID: undefined }] }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })

    test('query variable combining null and non-null values', async () => {
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const variables = { filter: [{ ID: { eq: 251 } }, { ID: null }] }
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
      const response = await POST('/graphql', { query, variables })
      expect(response.data).toEqual({ data })
    })
  })
})
