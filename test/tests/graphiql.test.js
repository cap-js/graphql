describe('graphql - GraphiQL', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, GET } = cds.test(path.join(__dirname, '../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  test('GET request to endpoint should serve HTML containing GraphiQL', async () => {
    const response = await GET('/graphql')
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
})
