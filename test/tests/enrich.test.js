describe('graphql - enrich AST ', () => {
  const cds = require('@sap/cds')
  // Load @cap-js/graphql plugin to ensure .to.gql and .to.graphql compile targets are registered
  require('../../cds-plugin')
  const { gql } = require('../util')
  const { parse } = require('graphql')
  const enrich = require('../../lib/resolvers/parse/ast/enrich')
  const { models } = require('../resources')
  const { fakeInfoObject } = require('../util')

  let bookshopSchema

  const _removeProperty = (obj, prop) => JSON.parse(JSON.stringify(obj, (k, v) => (k === prop ? undefined : v)))

  beforeAll(async () => {
    const bookshopModel = models.find(m => m.name === 'bookshop-graphql')
    const csn = await cds.load(bookshopModel.files)
    bookshopSchema = cds.compile(csn).to.gql({ as: 'object' })
  })

  describe('fragments are substituted into the AST', () => {
    test('fragment with multiple scalar fields is substituted into the AST', async () => {
      const queryWithFragment = gql`
        {
          AdminService {
            Books {
              nodes {
                ...myFragmentA
              }
            }
          }
        }

        fragment myFragmentA on AdminService_Books {
          ID
          title
        }
      `
      const documentWithFragment = parse(queryWithFragment)
      const fakeInfoWithFragment = fakeInfoObject(documentWithFragment, bookshopSchema, 'Query')
      const enrichedASTWithFragment = enrich(fakeInfoWithFragment)
      const enrichedASTWithFragmentWithoutLoc = _removeProperty(enrichedASTWithFragment, 'loc')

      const queryWithoutFragment = gql`
        {
          AdminService {
            Books {
              nodes {
                ID
                title
              }
            }
          }
        }
      `
      const documentWithoutFragment = parse(queryWithoutFragment)
      const fakeInfoWithoutFragment = fakeInfoObject(documentWithoutFragment, bookshopSchema, 'Query')
      const enrichedASTWithoutFragment = enrich(fakeInfoWithoutFragment)
      const enrichedASTWithoutFragmentWithoutLoc = _removeProperty(enrichedASTWithoutFragment, 'loc')

      expect(enrichedASTWithFragmentWithoutLoc).toMatchObject(enrichedASTWithoutFragmentWithoutLoc)
    })

    test('nested fragments are substituted into the AST', async () => {
      const queryWithFragment = gql`
        query {
          AdminService {
            ...myFragmentB
          }
        }

        fragment myFragmentB on AdminService {
          Books {
            ...myFragmentC
          }
        }

        fragment myFragmentC on AdminService_Books_connection {
          nodes {
            ...myFragmentD
          }
        }

        fragment myFragmentD on AdminService_Books {
          title
        }
      `
      const documentWithFragment = parse(queryWithFragment)
      const fakeInfoWithFragment = fakeInfoObject(documentWithFragment, bookshopSchema, 'Query')
      const enrichedASTWithFragment = enrich(fakeInfoWithFragment)
      const enrichedASTWithFragmentWithoutLoc = _removeProperty(enrichedASTWithFragment, 'loc')

      const queryWithoutFragment = gql`
        {
          AdminService {
            Books {
              nodes {
                title
              }
            }
          }
        }
      `
      const documentWithoutFragment = parse(queryWithoutFragment)
      const fakeInfoWithoutFragment = fakeInfoObject(documentWithoutFragment, bookshopSchema, 'Query')
      const enrichedASTWithoutFragment = enrich(fakeInfoWithoutFragment)
      const enrichedASTWithoutFragmentWithoutLoc = _removeProperty(enrichedASTWithoutFragment, 'loc')

      expect(enrichedASTWithFragmentWithoutLoc).toMatchObject(enrichedASTWithoutFragmentWithoutLoc)
    })
  })

  describe('__typename fields are removed from the AST', () => {
    test('__typename fields on multiple nesting levels are removed from the AST', async () => {
      const query = gql`
        {
          __typename
          AdminService {
            __typename
            Books {
              __typename
              nodes {
                __typename
                title
              }
            }
          }
        }
      `
      const document = parse(query)
      const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
      const enrichedAST = enrich(fakeInfo)
      expect(enrichedAST).toMatchObject([
        {
          name: { value: 'AdminService' },
          selectionSet: {
            selections: [
              {
                name: { value: 'Books' },
                selectionSet: {
                  selections: [
                    {
                      name: { value: 'nodes' },
                      selectionSet: {
                        selections: [
                          {
                            name: { value: 'title' }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ])
    })
  })

  describe('inline literal values are parsed within the AST', () => {
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

  describe('variable values are substituted into the AST', () => {
    test('variable value passed as argument is substituted into the AST to match argument literal value', async () => {
      const queryVariable = gql`
        query ($top: Int) {
          AdminService {
            Books(top: $top) {
              totalCount
            }
          }
        }
      `
      const variables = { top: 1 }
      const documentVariable = parse(queryVariable)
      const fakeInfoVariable = fakeInfoObject(documentVariable, bookshopSchema, 'Query', variables)
      const enrichedASTVariable = enrich(fakeInfoVariable)
      const enrichedASTVariableWithoutLoc = _removeProperty(enrichedASTVariable, 'loc')

      const queryLiteral = gql`
        {
          AdminService {
            Books(top: 1) {
              totalCount
            }
          }
        }
      `
      const documentLiteral = parse(queryLiteral)
      const fakeInfoLiteral = fakeInfoObject(documentLiteral, bookshopSchema, 'Query')
      const enrichedASTLiteral = enrich(fakeInfoLiteral)
      const enrichedASTLiteralWithoutLoc = _removeProperty(enrichedASTLiteral, 'loc')

      expect(enrichedASTVariableWithoutLoc).toMatchObject(enrichedASTLiteralWithoutLoc)
    })

    test('variable value passed as nested input value is substituted into the AST to match nested input literal value', async () => {
      const queryVariable = gql`
        query ($filter: BookFilter!) {
          AdminService {
            Books(filter: $filter) {
              totalCount
            }
          }
        }
      `
      const variables = { filter: { ID: { eq: 1 } } }
      const documentVariable = parse(queryVariable)
      const fakeInfoVariable = fakeInfoObject(documentVariable, bookshopSchema, 'Query', variables)
      const enrichedASTVariable = enrich(fakeInfoVariable)
      const enrichedASTVariableWithoutLoc = _removeProperty(enrichedASTVariable, 'loc')

      const queryLiteral = gql`
        {
          AdminService {
            Books(filter: { ID: { eq: 1 } }) {
              totalCount
            }
          }
        }
      `
      const documentLiteral = parse(queryLiteral)
      const fakeInfoLiteral = fakeInfoObject(documentLiteral, bookshopSchema, 'Query')
      const enrichedASTLiteral = enrich(fakeInfoLiteral)
      const enrichedASTLiteralWithoutLoc = _removeProperty(enrichedASTLiteral, 'loc')

      expect(enrichedASTVariableWithoutLoc).toMatchObject(enrichedASTLiteralWithoutLoc)
    })
  })

  describe('null values are enriched with a convenience value of null', () => {
    test('null value passed as argument has a value of null', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: null) {
              totalCount
            }
          }
        }
      `
      const document = parse(query)
      const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
      const enrichedAST = enrich(fakeInfo)
      const value = enrichedAST[0].selectionSet.selections[0].arguments[0].value.value
      expect(value).toEqual(null)
    })

    test('null value passed as nested input value has a value of null', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: { eq: null } }) {
              totalCount
            }
          }
        }
      `
      const document = parse(query)
      const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
      const enrichedAST = enrich(fakeInfo)
      const value = enrichedAST[0].selectionSet.selections[0].arguments[0].value.fields[0].value.fields[0].value.value
      expect(value).toEqual(null)
    })

    test('null value passed as nested input value within a list has a value of null', async () => {
      const query = gql`
        {
          AdminService {
            Books(filter: { ID: { ne: [1, null, 3] } }) {
              totalCount
            }
          }
        }
      `
      const document = parse(query)
      const fakeInfo = fakeInfoObject(document, bookshopSchema, 'Query')
      const enrichedAST = enrich(fakeInfo)
      const value =
        enrichedAST[0].selectionSet.selections[0].arguments[0].value.fields[0].value.fields[0].value.values[1].value
      expect(value).toEqual(null)
    })
  })
})
