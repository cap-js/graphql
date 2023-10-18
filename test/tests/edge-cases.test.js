describe('graphql - edge cases', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../resources/edge-cases'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset()
  })

  test('no name clashes occur between CDS names and connection fields with 2 one', async () => {
    const queryCreate = gql`
      mutation {
        FieldsWithConnectionNamesService {
          Root {
            create(input: { totalCount: "foo", nodes: { totalCount: "bar", nodes: "baz" } }) {
              totalCount
              nodes {
                totalCount
                nodes
              }
            }
          }
        }
      }
    `
    const dataCreate = {
      FieldsWithConnectionNamesService: {
        Root: {
          create: [
            {
              totalCount: 'foo',
              nodes: {
                totalCount: 'bar',
                nodes: 'baz'
              }
            }
          ]
        }
      }
    }
    const responseCreate = await POST('/graphql', { query: queryCreate })
    expect(responseCreate.data).toEqual({ data: dataCreate })

    const queryRead = gql`
      {
        FieldsWithConnectionNamesService {
          Root {
            totalCount
            nodes {
              totalCount
              nodes {
                totalCount
                nodes
              }
            }
          }
        }
      }
    `
    const dataRead = {
      FieldsWithConnectionNamesService: {
        Root: {
          totalCount: 1,
          nodes: [
            {
              totalCount: 'foo',
              nodes: {
                totalCount: 'bar',
                nodes: 'baz'
              }
            }
          ]
        }
      }
    }
    const responseRead = await POST('/graphql', { query: queryRead })
    expect(responseRead.data).toEqual({ data: dataRead })
  })
})
