describe('graphql - delete mutations', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset()
  })

  test('delete no entries', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            delete(filter: { ID: { eq: 0 } })
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          delete: 0
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toEqual([
      { title: 'Wuthering Heights' },
      { title: 'Jane Eyre' },
      { title: 'The Raven' },
      { title: 'Eleonora' },
      { title: 'Catweazle' }
    ])
  })

  test('delete single entry without variables', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          delete: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete single entry with variables', async () => {
    const query = gql`
      mutation ($filter: AdminService_Books_filter) {
        AdminService {
          Books {
            delete(filter: [$filter])
          }
        }
      }
    `
    const variables = { filter: { ID: { eq: 207 } } }
    const data = {
      AdminService: {
        Books: {
          delete: 1
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete multiple entries', async () => {
    const query = gql`
      mutation ($filter: AdminService_Books_filter) {
        AdminService {
          Books {
            delete(filter: [$filter])
          }
        }
      }
    `
    const variables = { filter: { ID: { ge: 252 } } }
    const data = {
      AdminService: {
        Books: {
          delete: 2
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 207, title: 'Jane Eyre' },
      { ID: 251, title: 'The Raven' }
    ])
  })

  test('delete all entries', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            delete(filter: {})
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          delete: 5
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result.length).toEqual(0)
  })

  test('delete entry with alias on service', async () => {
    const query = gql`
      mutation {
        myAlias: AdminService {
          Books {
            delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      myAlias: {
        Books: {
          delete: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete entry with alias on entity', async () => {
    const query = gql`
      mutation {
        AdminService {
          myAlias: Books {
            delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      AdminService: {
        myAlias: {
          delete: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete entry with alias on delete mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            myAlias: delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          myAlias: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete entry with aliases on all fields', async () => {
    const query = gql`
      mutation {
        myAliasA: AdminService {
          myAliasB: Books {
            myAliasC: delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      myAliasA: {
        myAliasB: {
          myAliasC: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })

  test('delete entry with meta field __typename on all nesting levels', async () => {
    const query = gql`
      mutation {
        __typename
        AdminService {
          __typename
          Books {
            __typename
            delete(filter: { ID: { eq: 207 } })
          }
        }
      }
    `
    const data = {
      __typename: 'Mutation',
      AdminService: {
        __typename: 'AdminService_input',
        Books: {
          __typename: 'AdminService_Books_input',
          delete: 1
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('ID', 'title')
    expect(result).toEqual([
      { ID: 201, title: 'Wuthering Heights' },
      { ID: 251, title: 'The Raven' },
      { ID: 252, title: 'Eleonora' },
      { ID: 271, title: 'Catweazle' }
    ])
  })
})
