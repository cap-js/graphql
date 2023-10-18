describe('graphql - enrich AST with parsed inline literal values', () => {
  const cds = require('@sap/cds')
  // Load @cap-js/graphql plugin to ensure .to.gql and .to.graphql compile targets are registered
  require('../../cds-plugin')
  const { gql } = require('../util')
  const { parse } = require('graphql')
  const enrich = require('../../lib/resolvers/parse/ast/enrich')
  const { models } = require('../resources')
  const { fakeInfoObject } = require('../util')

  let bookshopSchema

  beforeAll(async () => {
    const bookshopModel = models.find(m => m.name === 'bookshop-graphql')
    const csn = await cds.load(bookshopModel.files)
    bookshopSchema = cds.compile(csn).to.gql({ as: 'object' })
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
