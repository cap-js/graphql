describe('graphql - queries with totalCount', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  test('simple query with totalCount', async () => {
    const query = gql`
      {
        AdminService {
          Books {
            totalCount
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
          totalCount: 5,
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

  test('query selecting only totalCount', async () => {
    const query = gql`
      {
        AdminService {
          Books {
            totalCount
          }
        }
      }
    `
    const data = {
      AdminService: {
        Books: {
          totalCount: 5
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })

  test('query with totalCount and simple filter', async () => {
    const query = gql`
      {
        AdminService {
          Books(filter: { ID: { eq: 201 } }) {
            totalCount
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
        Books: { totalCount: 1, nodes: [{ ID: 201, title: 'Wuthering Heights' }] }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })

  test('query with totalCount on nested fields', async () => {
    const query = gql`
      {
        AdminService {
          Authors {
            totalCount
            nodes {
              books {
                totalCount
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
          totalCount: 4,
          nodes: [
            { books: { totalCount: null, nodes: [{ title: 'Wuthering Heights' }] } },
            { books: { totalCount: null, nodes: [{ title: 'Jane Eyre' }] } },
            { books: { totalCount: null, nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] } },
            { books: { totalCount: null, nodes: [{ title: 'Catweazle' }] } }
          ]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })

  test('query with totalCount and top and skip', async () => {
    const query = gql`
      {
        AdminService {
          Authors(top: 2, skip: 2) {
            totalCount
            nodes {
              name
            }
          }
        }
      }
    `
    const data = {
      AdminService: {
        Authors: { totalCount: 4, nodes: [{ name: 'Edgar Allen Poe' }, { name: 'Richard Carpenter' }] }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })

  test('query with totalCount and top and skip arguments on nested fields', async () => {
    const query = gql`
      {
        AdminService {
          Authors(top: 2, skip: 2) {
            totalCount
            nodes {
              name
              books(top: 1, skip: 1) {
                totalCount
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
        Authors: null
      }
    }
    const errors = [
      {
        locations: [{ column: 11, line: 4 }],
        message: 'Pagination is not supported in expand',
        path: ['AdminService', 'Authors'],
        extensions: expect.any(Object)
      }
    ]
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data, errors })
  })

  test('query with aliases on totalCount on nested fields', async () => {
    const query = gql`
      {
        AdminService {
          Authors {
            myAliasA: totalCount
            myAliasB: totalCount
            nodes {
              books {
                myAliasC: totalCount
                myAliasD: totalCount
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
          myAliasA: 4,
          myAliasB: 4,
          nodes: [
            { books: { myAliasC: null, myAliasD: null, nodes: [{ title: 'Wuthering Heights' }] } },
            { books: { myAliasC: null, myAliasD: null, nodes: [{ title: 'Jane Eyre' }] } },
            {
              books: {
                myAliasC: null,
                myAliasD: null,
                nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }]
              }
            },
            { books: { myAliasC: null, myAliasD: null, nodes: [{ title: 'Catweazle' }] } }
          ]
        }
      }
    }
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })
})
