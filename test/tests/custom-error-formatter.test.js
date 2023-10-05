describe('graphql - custom error formatter function', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/custom-error-formatter'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  test('response contains error formatted by a custom error formatter function', async () => {
    const query = gql`
      {
        CustomErrorFormatterService {
          A {
            nodes {
              ID
            }
          }
        }
      }
    `
    const errors = [
      {
        message: 'Oops! Multiple errors occurred. Please see the details for more information.',
        extensions: {
          custom: 'This property is added by the custom error formatter',
          count: 2,
          details: [
            {
              message: 'Oops! Some Custom Error Message 1',
              custom: 'This property is added by the custom error formatter',
              count: 0
            },
            {
              message: 'Oops! Some Custom Error Message 2',
              custom: 'This property is added by the custom error formatter',
              count: 1
            }
          ]
        }
      }
    ]
    const response = await POST('/graphql', { query })
    expect(response.data).toMatchObject({ errors })
  })
})
