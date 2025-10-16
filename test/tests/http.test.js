const cds = require('@sap/cds')
const path = require('path')
const util = require('util')
const { axios } = cds
    .test('serve', 'srv/empty-service.cds')
    .in(path.join(__dirname, '../resources/empty-csn-definitions'))
const _format = e => util.formatWithOptions({ colors: false, depth: null }, ...(Array.isArray(e) ? e : [e]))

let _error = []    

describe('GraphQL express json parser error scenario', () => {
  beforeEach(() => {
    console.warn = (...s) => _error.push(s) // eslint-disable-line no-console
  })

  afterEach(() => {
    _error = []
  })
  test('should trigger InvalidJSON for malformed JSON', async () => {
    try {
     response = await axios.request({
          method: 'POST',
          url: `/graphql`,
          data: '{ some_value'
    })
    } catch (err) {
       expect(err.status).toBe(400)
       expect(err.response.data.error.message).toBe(`Unexpected token '"', ""{ some_value"" is not valid JSON`)
       expect(_format(_error[0])).toContain('InvalidJSON')
    }
  })
})
