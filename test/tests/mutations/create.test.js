describe('graphql - create mutations', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  axios.defaults.headers = {
    authorization: 'Basic YWxpY2U6'
  }

  beforeEach(async () => {
    await data.reset()
  })

  test('create empty entry', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            create(input: {}) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          create: [{ title: null }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title', 'stock', 'price', 'descr')
    expect(result).toContainEqual({ title: null, stock: null, price: null, descr: null })
  })

  test('create single entry without variables', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            create(input: { title: "Moby-Dick" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          create: [{ title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create single entry with variables', async () => {
    const query = gql`
      mutation ($input: AdminService_Books_C) {
        AdminService {
          Books {
            create(input: [$input]) {
              title
            }
          }
        }
      }
    `
    const input = { title: 'Moby-Dick' }
    const variables = { input }
    const data = {
      AdminService: {
        Books: {
          create: [input]
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual(input)
  })

  test('create multiple entries', async () => {
    const query = gql`
      mutation ($input: [AdminService_Books_C]!) {
        AdminService {
          Books {
            create(input: $input) {
              title
            }
          }
        }
      }
    `
    const input = [
      { title: 'The Fellowship of the Ring' },
      { title: 'The Two Towers' },
      { title: 'The Return of the King' }
    ]
    const variables = { input }
    const data = {
      AdminService: {
        Books: {
          create: input
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual(input[0])
    expect(result).toContainEqual(input[1])
    expect(result).toContainEqual(input[2])
  })

  test('create entry with deep insert', async () => {
    const query = gql`
      mutation ($input: AdminService_Books_C) {
        AdminService {
          Books {
            create(input: [$input]) {
              ID
              title
              chapters {
                nodes {
                  number
                  title
                }
              }
            }
          }
        }
      }
    `
    const chapters = [
      { number: 1, title: "Marley's Ghost" },
      { number: 2, title: 'The First of the Three Spirits' },
      { number: 3, title: 'The Second of the Three Spirits' },
      { number: 4, title: 'The Last of the Spirits' },
      { number: 5, title: 'The End of it' }
    ]
    const book = {
      ID: 600, // <- autogenerated keys only with UUIDs
      title: 'A Christmas Carol'
    }
    const input = { ...book, chapters }
    const variables = { input }
    const data = {
      AdminService: {
        Books: {
          create: [{ ...book, chapters: { nodes: chapters } }]
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns(`{ ID, title, chapters { number, title } }`)
    expect(result).toContainEqual(input)
  })

  test('create entry with fragment on create mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            create(input: { title: "Moby-Dick" }) {
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
          create: [{ title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with alias on service', async () => {
    const query = gql`
      mutation {
        myAlias: AdminService {
          Books {
            create(input: { title: "Moby-Dick" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      myAlias: {
        Books: {
          create: [{ title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with alias on entity', async () => {
    const query = gql`
      mutation {
        AdminService {
          myAlias: Books {
            create(input: { title: "Moby-Dick" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        myAlias: {
          create: [{ title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with alias on create mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            myAlias: create(input: { title: "Moby-Dick" }) {
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          myAlias: [{ title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with alias on field of create mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            create(input: { title: "Moby-Dick" }) {
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
          create: [{ myAliasA: 'Moby-Dick', myAliasB: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with deep insert with aliases on nested fields', async () => {
    const query = gql`
      mutation ($input: AdminService_Books_C) {
        AdminService {
          Books {
            create(input: [$input]) {
              ID
              title
              myAliasA: chapters {
                nodes {
                  number
                  myAliasB: title
                }
              }
            }
          }
        }
      }
    `
    const chapters = [
      { number: 1, title: "Marley's Ghost" },
      { number: 2, title: 'The First of the Three Spirits' },
      { number: 3, title: 'The Second of the Three Spirits' },
      { number: 4, title: 'The Last of the Spirits' },
      { number: 5, title: 'The End of it' }
    ]
    const book = {
      ID: 600, // <- autogenerated keys only with UUIDs
      title: 'A Christmas Carol'
    }
    const input = { ...book, chapters }
    const variables = { input }
    const data = {
      AdminService: {
        Books: {
          create: [{ ...book, myAliasA: { nodes: chapters.map(c => ({ number: c.number, myAliasB: c.title })) } }]
        }
      }
    }
    const response = await POST('/graphql', { query, variables })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns(`{ ID, title, chapters { number, title } }`)
    expect(result).toContainEqual(input)
  })

  test('create entry with aliases on all fields', async () => {
    const query = gql`
      mutation {
        myAliasA: AdminService {
          myAliasB: Books {
            myAliasC: create(input: { title: "Moby-Dick" }) {
              myAliasD: title
            }
          }
        }
      }
    `
    const data = {
      myAliasA: {
        myAliasB: {
          myAliasC: [{ myAliasD: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with meta field __typename in create mutation', async () => {
    const query = gql`
      mutation {
        AdminService {
          Books {
            create(input: { title: "Moby-Dick" }) {
              __typename
              title
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          create: [{ __typename: 'AdminService_Books', title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })

  test('create entry with meta field __typename on all nesting levels', async () => {
    const query = gql`
      mutation {
        __typename
        AdminService {
          __typename
          Books {
            __typename
            create(input: { title: "Moby-Dick" }) {
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
          create: [{ __typename: 'AdminService_Books', title: 'Moby-Dick' }]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })

    const result = await SELECT.from('sap.capire.bookshop.Books').columns('title')
    expect(result).toContainEqual({ title: 'Moby-Dick' })
  })
})
