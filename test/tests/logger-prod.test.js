describe('graphql - query logging with sanitization in production', () => {
  process.env.NODE_ENV = 'production'
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')
  const util = require('util')

  const { axios, GET, POST, data } = cds.test(path.join(__dirname, '../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  const _format = e => util.formatWithOptions({ colors: false, depth: null }, ...(Array.isArray(e) ? e : [e]))

  let _log

  beforeEach(async () => {
    await data.reset()
    _log = jest.spyOn(console, 'info')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST requests', () => {
    test('Do not log requests with undefined queries', async () => {
      const response = await POST('/graphql')
      expect(response.status).toEqual(400)
      expect(response.data.errors[0]).toEqual({ message: 'Missing query' })
      expect(_log.mock.calls.length).toEqual(0)
    })

    test('Log should contain HTTP method', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await POST('/graphql', { query })
      expect(_format(_log.mock.calls[0])).toContain('POST')
    })

    test('Log should not contain operationName if none was provided', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await POST('/graphql', { query })
      expect(_format(_log.mock.calls[0])).not.toContain('operationName')
    })

    test('Log should not contain variables if none were provided', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await POST('/graphql', { query })
      expect(_format(_log.mock.calls[0])).not.toContain('variables')
    })

    test('Log should contain operationName and its value', async () => {
      const operationName = 'ListBooks'
      const query = gql`
        query ListAuthors {
          AdminService {
            Authors {
              nodes {
                name
              }
            }
          }
        }
        query ${operationName} {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await POST('/graphql', { operationName, query })
      expect(_format(_log.mock.calls[0])).toContain(`operationName: '${operationName}'`)
    })

    test('Log should not contain literal values', async () => {
      const secretTitle = 'secret'
      const query = gql`
        mutation {
          AdminService {
            Books {
              create (input: { title: "${secretTitle}" }) {
                title
              }
            }
          }
        }
      `
      await POST('/graphql', { query })
      expect(_format(_log.mock.calls[0])).not.toContain(secretTitle)
    })

    test('Log should not contain variables or their values', async () => {
      const secretTitle = 'secret'
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
      const variables = { input: { title: secretTitle } }
      await POST('/graphql', { query, variables })
      expect(_format(_log.mock.calls[0])).not.toContain('$input')
      expect(_format(_log.mock.calls[0])).not.toContain(secretTitle)
    })
  })

  describe('GET requests', () => {
    test('Do not log requests with undefined queries', async () => {
      const response = await GET('/graphql')
      expect(response.status).toEqual(200)
      expect(response.data).toMatch(/html/i) // GraphiQL is returned
      expect(_log.mock.calls.length).toEqual(0)
    })

    test('Log should contain HTTP method', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await GET(`/graphql?query=${query}`)
      expect(_format(_log.mock.calls[0])).toContain('GET')
    })

    test('Log should not contain operationName if none was provided', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await GET(`/graphql?query=${query}`)
      expect(_format(_log.mock.calls[0])).not.toContain('operationName')
    })

    test('Log should not contain variables if none were provided', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await GET(`/graphql?query=${query}`)
      expect(_format(_log.mock.calls[0])).not.toContain('variables')
    })

    test('Log should contain operationName and its value', async () => {
      const operationName = 'ListBooks'
      const query = gql`
        query ListAuthors {
          AdminService {
            Authors {
              nodes {
                name
              }
            }
          }
        }
        query ${operationName} {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      await GET(`/graphql?operationName=${operationName}&query=${query}`)
      expect(_format(_log.mock.calls[0])).toContain(`operationName: '${operationName}'`)
    })

    test('Log should not contain literal values', async () => {
      const secretTitle = 'secret'
      const query = gql`
        query {
          AdminService {
            Books(filter: { title: { ne: "${secretTitle}"}}) {
              nodes {
                title
              }
            }
          }
        }
      `
      await GET(`/graphql?query=${query}`)
      expect(_format(_log.mock.calls[0])).not.toContain(secretTitle)
    })

    test('Log should not contain variables or their values', async () => {
      const secretTitle = 'secret'
      const query = gql`
        query ($filter: [AdminService_Books_filter]) {
          AdminService {
            Books(filter: $filter) {
              nodes {
                title
              }
            }
          }
        }
      `
      const variables = { filter: { title: { ne: secretTitle } } }
      await GET(`/graphql?query=${query}&variables=${JSON.stringify(variables)}`)
      expect(_format(_log.mock.calls[0])).not.toContain('$filter')
      expect(_format(_log.mock.calls[0])).not.toContain(secretTitle)
    })
  })
})
