describe('graphql - empty query root operation type', () => {
  const cds = require('@sap/cds')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds
    .test('serve', 'srv/empty-service.cds')
    .in(path.join(__dirname, '../resources/empty-csn-definitions'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  test('_ placeholder field of type Void returns null', async () => {
    const query = gql`
      {
        _
      }
    `
    const data = {
      _: null
    }

    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data })
  })
})
