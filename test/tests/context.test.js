describe('graphql - context is set', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    const deleteAll = `#graphql
      mutation {
        TestService {
          Foo {
            delete
          }
        }
      }
    `
    await POST('/graphql', { query: deleteAll })
    const insertOne = `#graphql
      mutation {
        TestService {
          Foo {
            create(input: { ID: 1, bar: "baz" }) {
              bar
            }
          }
        }
      }
    `
    await POST('/graphql', { query: insertOne })
  })

  test('read', async () => {
    const query = `#graphql
      {
        TestService {
          Foo {
            nodes {
              ID
              bar
            }
          }
        }
      }
    `
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data: { TestService: { Foo: { nodes: [{ ID: 1, bar: 'baz' }] } } } })
  })

  test('create', async () => {
    const query = `#graphql
      mutation {
        TestService {
          Foo {
            create(input: { ID: 2, bar: "boo" }) {
              ID
              bar
            }
          }
        }
      }
    `
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({
      data: { TestService: { Foo: { create: [{ ID: 2, bar: 'boo' }] } } }
    })
  })

  test('update', async () => {
    const query = `#graphql
      mutation {
        TestService {
          Foo {
            update(
              filter: { ID: { eq: 1 } },
              input: { bar: "boo" }
            ) {
              ID
              bar
            }
          }
        }
      }
    `
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({
      data: { TestService: { Foo: { update: [{ ID: 1, bar: 'boo' }] } } }
    })
  })

  test('delete', async () => {
    const query = `#graphql
      mutation {
        TestService {
          Foo {
            delete(filter: { ID: { eq: 1 } })
          }
        }
      }
    `
    const response = await POST('/graphql', { query })
    expect(response.data).toEqual({ data: { TestService: { Foo: { delete: 1 } } } })
  })
})
