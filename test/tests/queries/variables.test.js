describe('graphql - variables', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries with variables without connections', () => {
    test('query variable of type input object passed as argument without connections', async () => {
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
        query ($filter: Int) {
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
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
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
      const query = `#graphql
        query ($filter: Int) {
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
  })
})
