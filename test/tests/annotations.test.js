describe('graphql - annotations', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/annotations'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('protocols annotations', () => {
    const path = '/custom-graphql-path'

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
      const response = await POST(path, { query })
      expect(response.data.errors[0].message).toMatch(/^Cannot query field "NotAnnotated" on type "Query"\./)
    })

    test('service annotated with @graphql is served at configured path', async () => {
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
      const response = await POST(path, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: \'graphql\'" is served at configured path', async () => {
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
      const response = await POST(path, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: [\'graphql\']" is served at configured path', async () => {
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
      const response = await POST(path, { query })
      expect(response.data).not.toHaveProperty('errors')
    })

    test('service annotated with "@protocol: [{kind: \'graphql\'}]" is served at configured path', async () => {
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
      const response = await POST(path, { query })
      expect(response.data).not.toHaveProperty('errors')
    })
  })
})
