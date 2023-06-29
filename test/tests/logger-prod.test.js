describe('graphql - query logging with sanetization in production', () => {
  process.env.NODE_ENV = 'production'
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')
  const util = require('util')

  const PROJECT_PATH = path.join(__dirname, '../resources/bookshop-graphql')

  const { axios, GET, POST, data } = cds.test(PROJECT_PATH)
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false
  data.autoReset(true)

  const _formatLogLine = logLineArray => util.formatWithOptions({ colors: false }, ...logLineArray)

  let _log

  beforeAll(async () => {
    await cds.deploy(path.join(PROJECT_PATH, 'srv'))
  })

  beforeEach(() => {
    _log = jest.spyOn(console, 'info')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST requests', () => {
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
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain(secretTitle)
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
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain('$input')
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain(secretTitle)
    })
  })

  describe('GET requests', () => {
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
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain(secretTitle)
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
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain('$filter')
      expect(_formatLogLine(_log.mock.calls[0])).not.toContain(secretTitle)
    })
  })
})
