describe('graphql - annotations', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/annotations'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  data.autoReset(true)

  describe('protocols annotations', () => {
    const endpoint = '/custom-graphql-endpoint'

    test('service not annotated is not served', async () => {
      const query = gql`
        {
          NotAnnotated {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST(endpoint, { query })
      expect(response.data.errors[0].message).toMatch(/^Cannot query field "NotAnnotated" on type "Query"\./)
    })

    test('service annotated with @graphql is served at configured endpoint', async () => {
      const query = gql`
        {
          AnnotatedWithAtGraphQL {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST(endpoint, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: \'graphql\'" is served at configured endpoint', async () => {
      const query = gql`
        {
          AnnotatedWithAtProtocolString {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST(endpoint, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: [\'graphql\']" is served at configured endpoint', async () => {
      const query = gql`
        {
          AnnotatedWithAtProtocolStringList {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST(endpoint, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: [{kind: \'graphql\'}]" is served at configured endpoint', async () => {
      const query = gql`
        {
          AnnotatedWithAtProtocolObjectList {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const response = await POST(endpoint, { query })
      expect(response.data).not.toHaveProperty('errors')
    })
  })
})
