describe('graphql - GraphiQL', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, GET } = cds.test(path.join(__dirname, '../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  axios.defaults.headers = {
    authorization: 'Basic YWxpY2U6'
  }

  test('GET request to endpoint should serve HTML containing GraphiQL', async () => {
    const response = await GET('/graphql')
    expect(response.headers['content-type']).toMatch(/text\/html/)
    expect(response.data).toMatch(/<html>[\s\S]*graphiql[\s\S]*<\/html>/)
  })

  test('query via GET request with URL parameter', async () => {
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
    const response = await GET('/graphql?query=' + query)
    expect(response.data).toEqual({ data })
  })

describe('GraphiQL link provider in service index', () => {
  let capturedService

  // Capture the service during the serving event
  cds.once('serving', service => {
    capturedService = service
  })

  // Helper function to find the GraphQL link provider
  const getGraphQLLinkProvider = () => {
    if (!capturedService?.$linkProviders) return undefined
    return capturedService.$linkProviders.find(provider => {
      const result = provider(null, { kind: 'graphql' })
      return result && result.name === 'GraphiQL'
    })
  }

  test('link provider should be registered on service', () => {
    expect(capturedService).toBeDefined()
    expect(capturedService.$linkProviders).toBeDefined()
    expect(Array.isArray(capturedService.$linkProviders)).toBe(true)

    const graphqlLinkProvider = getGraphQLLinkProvider()
    expect(graphqlLinkProvider).toBeDefined()
    expect(typeof graphqlLinkProvider).toBe('function')
  })

  test('link provider returns nothing when entity is provided', () => {
    const graphqlLinkProvider = getGraphQLLinkProvider()
    const result = graphqlLinkProvider({ name: 'SomeEntity' }, { kind: 'graphql' })
    expect(result).toBeUndefined()
  })

  test('link provider returns nothing when endpoint kind is not graphql', () => {
    const graphqlLinkProvider = getGraphQLLinkProvider()

    // Test various non-GraphQL endpoint kinds
    const testCases = [
      { kind: 'odata' },
      { kind: 'rest' },
      { kind: 'fiori' },
      { kind: null },
      { kind: undefined },
      {},
      null,
      undefined
    ]

    testCases.forEach(endpoint => {
      const result = graphqlLinkProvider(null, endpoint)
      expect(result).toBeUndefined()
    })
  })

  test('link provider returns correct link object for GraphQL endpoint', () => {
    const graphqlLinkProvider = getGraphQLLinkProvider()
    const result = graphqlLinkProvider(null, { kind: 'graphql' })

    expect(result).toBeDefined()
    expect(result).toEqual({
      href: '/graphql',
      name: 'GraphiQL',
      title: 'Show in GraphiQL'
    })
  })

  test('GraphiQL link appears in service index HTML', async () => {
    const response = await GET('/')

    // Verify the response is HTML
    expect(response.headers['content-type']).toMatch(/text\/html/)

    // Check that the response contains the GraphiQL link
    expect(response.data).toMatch(/GraphiQL/)
    expect(response.data).toMatch(/\/graphql/)
  })
})

})


