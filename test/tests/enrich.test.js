describe('graphql - enrich AST with parsed inline literal values', () => {
  const { gql } = require('../util')
  const { parse } = require('graphql')
  const enrich = require('../../lib/resolvers/parse/ast/enrich')
  const { models } = require('../resources')
  const { cdsFilesToGQLSchema, fakeInfoObject } = require('../util')

  let bookshopSchema

  beforeAll(async () => {
    const bookshopModel = models.find(m => m.name === 'bookshop-graphql')
    bookshopSchema = await cdsFilesToGQLSchema(bookshopModel.files)
  })

  test('parsing of literal value as top level argument', async () => {
    const query = gql`
      {
        AdminService {
          Authors(top: 2) {
            nodes {
              name
            }
          }
        }
      }
    `
    const document = parse(query)
    const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
    const enrichedAST = enrich(fakeInfo)
    const value = enrichedAST[0].selectionSet.selections[0].arguments[0].value.value
    expect(value).toEqual(2)
  })

  test('parsing of literal value in nested input value', async () => {
    const query = gql`
      {
        AdminService {
          Books(filter: { ID: { eq: 201 } }) {
            nodes {
              ID
              title
            }
          }
        }
      }
    `
    const document = parse(query)
    const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
    const enrichedAST = enrich(fakeInfo)
    const value = enrichedAST[0].selectionSet.selections[0].arguments[0].value.fields[0].value.fields[0].value.value
    expect(value).toEqual(201)
  })
})
