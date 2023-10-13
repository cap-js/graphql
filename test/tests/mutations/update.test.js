describe('graphql - update mutations', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset() 
  })

  test('update no entries', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            update(filter: { title: { eq: "This book does not exist" } }, input: { stock: 0 }) {
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
          update: []
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title', 'stock')
    expect(result).toEqual([
      { title: 'Wuthering Heights', stock: 12 },
      { title: 'Jane Eyre', stock: 11 },
      { title: 'The Raven', stock: 333 },
      { title: 'Eleonora', stock: 555 },
      { title: 'Catweazle', stock: 22 }
    ])
  })

  test('update single entry without variables', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
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
          update: [{ title: 'Sturmhöhe', stock: 12 }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update single entry with variables', async () => {
    const query = gql`
      mutation ($filter: AdminService_Books_filter, $input: AdminService_Books_U!) {
        AdminService {
          Books {
            update(filter: [$filter], input: $input) {
              title
            }
          }
        }
      }
    `
    const input = { title: 'Sturmhöhe' }
    const variables = { filter: { title: { eq: 'Wuthering Heights' } }, input }
    const data = {
      AdminService: {
        Books: {
          update: [input]
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual(input)
  })

  test('update multiple entries', async () => {
    const query = gql`
      mutation ($filter: AdminService_Books_filter, $input: AdminService_Books_U!) {
        AdminService {
          Books {
            update(filter: [$filter], input: $input) {
              title
              stock
            }
          }
        }
      }
    `
    const variables = { filter: { title: { contains: 'a' } }, input: { stock: 0 } }
    const data = {
      AdminService: {
        Books: {
          update: [
            { title: 'Jane Eyre', stock: 0 },
            { title: 'The Raven', stock: 0 },
            { title: 'Eleonora', stock: 0 },
            { title: 'Catweazle', stock: 0 }
          ]
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title', 'stock')
    expect(result).toEqual([
      { title: 'Wuthering Heights', stock: 12 },
      { title: 'Jane Eyre', stock: 0 },
      { title: 'The Raven', stock: 0 },
      { title: 'Eleonora', stock: 0 },
      { title: 'Catweazle', stock: 0 }
    ])
  })

  test('update all entries', async () => {
    const query = gql`
      mutation ($input: AdminService_Books_U!) {
        AdminService {
          Books {
            update(filter: {}, input: $input) {
              title
              stock
            }
          }
        }
      }
    `
    const variables = { input: { stock: 100 } }
    const books = [
      { title: 'Wuthering Heights', stock: 100 },
      { title: 'Jane Eyre', stock: 100 },
      { title: 'The Raven', stock: 100 },
      { title: 'Eleonora', stock: 100 },
      { title: 'Catweazle', stock: 100 }
    ]
    const data = {
      AdminService: {
        Books: {
          update: books
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title', 'stock')
    expect(result).toEqual(books)
  })

  test('update entry with fragment', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
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
          update: [{ title: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with alias on service', async () => {
    const query = gql`
      mutation {
        myAlias: AdminService {
          Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      myAlias: {
        Books: {
          update: [{ title: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with alias on entity', async () => {
    const query = gql`
      mutation {
        AdminService {
          myAlias: Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        myAlias: {
          update: [{ title: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with alias on update mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            myAlias: update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          myAlias: [{ title: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with alias on field of update mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              myAliasA: title
              myAliasB: title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          update: [{ myAliasA: 'Sturmhöhe', myAliasB: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with aliases on all fields', async () => {
    const query = gql`
      mutation {
        myAliasA: AdminService {
          myAliasB: Books {
            myAliasC: update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              myAliasD: title
            }
          }
        }
      }
    `
    const data = {
      myAliasA: {
        myAliasB: {
          myAliasC: [{ myAliasD: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with meta field __typename in update mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              title
              __typename
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          update: [{ title: 'Sturmhöhe', __typename: 'AdminService_Books' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })

  test('update entry with meta field __typename on all nesting levels', async () => {
    const query = gql`
      mutation {
        __typename
        AdminService {
          __typename
          Books {
            __typename
            update(filter: { title: { eq: "Wuthering Heights" } }, input: { title: "Sturmhöhe" }) {
              __typename
              title
            }
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
          update: [{ __typename: 'AdminService_Books', title: 'Sturmhöhe' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Sturmhöhe' })
  })
})
