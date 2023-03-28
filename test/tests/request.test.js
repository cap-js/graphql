describe('graphql - cds.request', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/request'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  test('HTTP headers are correctly passed to custom handlers', async () => {
    const query = gql`
      {
        RequestService {
          A {
            nodes {
              my_header
            }
          }
        }
      }
    `
    const my_header = 'my header value'
    const data = {
      RequestService: {
        A: {
          nodes: [{ my_header }]
        }
      }
    }
    const response = await POST('/graphql', { query }, { headers: { my_header } })
    expect(response.data).toEqual({ data })
  })
})
