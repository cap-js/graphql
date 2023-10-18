describe('graphql - queries', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../../util')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../../resources/bookshop-graphql'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset() 
  })

  // REVISIT: unskip for support of configurable schema flavors
  describe.skip('queries without arguments without connections', () => {
    test('simple query', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              title
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { title: 'Wuthering Heights' },
            { title: 'Jane Eyre' },
            { title: 'The Raven' },
            { title: 'Eleonora' },
            { title: 'Catweazle' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with null result values', async () => {
      await INSERT.into('sap.capire.bookshop.Books').entries({ title: 'Moby-Dick' })

      const query = gql`
        {
          AdminServiceBasic {
            Books {
              title
              stock
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { title: 'Wuthering Heights', stock: 12 },
            { title: 'Jane Eyre', stock: 11 },
            { title: 'The Raven', stock: 333 },
            { title: 'Eleonora', stock: 555 },
            { title: 'Catweazle', stock: 22 },
            { title: 'Moby-Dick', stock: null }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('nested query containing to-one association', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              title
              author {
                name
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { title: 'Wuthering Heights', author: { name: 'Emily Brontë' } },
            { title: 'Jane Eyre', author: { name: 'Charlotte Brontë' } },
            { title: 'The Raven', author: { name: 'Edgar Allen Poe' } },
            { title: 'Eleonora', author: { name: 'Edgar Allen Poe' } },
            { title: 'Catweazle', author: { name: 'Richard Carpenter' } }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('nested query containing to-many association', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors {
              name
              books {
                title
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            { books: [{ title: 'Wuthering Heights' }], name: 'Emily Brontë' },
            { books: [{ title: 'Jane Eyre' }], name: 'Charlotte Brontë' },
            { books: [{ title: 'The Raven' }, { title: 'Eleonora' }], name: 'Edgar Allen Poe' },
            { books: [{ title: 'Catweazle' }], name: 'Richard Carpenter' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('complex query', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Books {
              title
              stock
              author {
                name
              }
            }
            Authors {
              name
            }
          }
          CatalogServiceBasic {
            Genres {
              name
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Books: [
            { title: 'Wuthering Heights', stock: 12, author: { name: 'Emily Brontë' } },
            { title: 'Jane Eyre', stock: 11, author: { name: 'Charlotte Brontë' } },
            { title: 'The Raven', stock: 333, author: { name: 'Edgar Allen Poe' } },
            { title: 'Eleonora', stock: 555, author: { name: 'Edgar Allen Poe' } },
            { title: 'Catweazle', stock: 22, author: { name: 'Richard Carpenter' } }
          ],
          Authors: [
            { name: 'Emily Brontë' },
            { name: 'Charlotte Brontë' },
            { name: 'Edgar Allen Poe' },
            { name: 'Richard Carpenter' }
          ]
        },
        CatalogServiceBasic: {
          Genres: [
            { name: 'Fiction' },
            { name: 'Drama' },
            { name: 'Poetry' },
            { name: 'Fantasy' },
            { name: 'Science Fiction' },
            { name: 'Romance' },
            { name: 'Mystery' },
            { name: 'Thriller' },
            { name: 'Dystopia' },
            { name: 'Fairy Tale' },
            { name: 'Non-Fiction' },
            { name: 'Biography' },
            { name: 'Autobiography' },
            { name: 'Essay' },
            { name: 'Speech' }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('recursive query', async () => {
      const query = gql`
        {
          AdminServiceBasic {
            Authors {
              name
              books {
                title
                author {
                  name
                  books {
                    title
                  }
                }
              }
            }
          }
        }
      `
      const data = {
        AdminServiceBasic: {
          Authors: [
            {
              books: [
                {
                  author: { books: [{ title: 'Wuthering Heights' }], name: 'Emily Brontë' },
                  title: 'Wuthering Heights'
                }
              ],
              name: 'Emily Brontë'
            },
            {
              books: [{ author: { books: [{ title: 'Jane Eyre' }], name: 'Charlotte Brontë' }, title: 'Jane Eyre' }],
              name: 'Charlotte Brontë'
            },
            {
              books: [
                {
                  author: { books: [{ title: 'The Raven' }, { title: 'Eleonora' }], name: 'Edgar Allen Poe' },
                  title: 'The Raven'
                },
                {
                  author: { books: [{ title: 'The Raven' }, { title: 'Eleonora' }], name: 'Edgar Allen Poe' },
                  title: 'Eleonora'
                }
              ],
              name: 'Edgar Allen Poe'
            },
            {
              books: [{ author: { books: [{ title: 'Catweazle' }], name: 'Richard Carpenter' }, title: 'Catweazle' }],
              name: 'Richard Carpenter'
            }
          ]
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })

  describe('queries without arguments with connections', () => {
    test('simple query', async () => {
      const query = gql`
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
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { title: 'Wuthering Heights' },
              { title: 'Jane Eyre' },
              { title: 'The Raven' },
              { title: 'Eleonora' },
              { title: 'Catweazle' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('query with null result values', async () => {
      await INSERT.into('sap.capire.bookshop.Books').entries({ title: 'Moby-Dick' })

      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
                stock
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { title: 'Wuthering Heights', stock: 12 },
              { title: 'Jane Eyre', stock: 11 },
              { title: 'The Raven', stock: 333 },
              { title: 'Eleonora', stock: 555 },
              { title: 'Catweazle', stock: 22 },
              { title: 'Moby-Dick', stock: null }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('nested query containing to-one association', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
                author {
                  name
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { title: 'Wuthering Heights', author: { name: 'Emily Brontë' } },
              { title: 'Jane Eyre', author: { name: 'Charlotte Brontë' } },
              { title: 'The Raven', author: { name: 'Edgar Allen Poe' } },
              { title: 'Eleonora', author: { name: 'Edgar Allen Poe' } },
              { title: 'Catweazle', author: { name: 'Richard Carpenter' } }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('nested query containing to-many association', async () => {
      const query = gql`
        {
          AdminService {
            Authors {
              nodes {
                name
                books {
                  nodes {
                    title
                  }
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Authors: {
            nodes: [
              { books: { nodes: [{ title: 'Wuthering Heights' }] }, name: 'Emily Brontë' },
              { books: { nodes: [{ title: 'Jane Eyre' }] }, name: 'Charlotte Brontë' },
              { books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] }, name: 'Edgar Allen Poe' },
              { books: { nodes: [{ title: 'Catweazle' }] }, name: 'Richard Carpenter' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('complex query', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
                stock
                author {
                  name
                }
              }
            }
            Authors {
              nodes {
                name
              }
            }
          }
          CatalogService {
            Genres {
              nodes {
                name
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              { title: 'Wuthering Heights', stock: 12, author: { name: 'Emily Brontë' } },
              { title: 'Jane Eyre', stock: 11, author: { name: 'Charlotte Brontë' } },
              { title: 'The Raven', stock: 333, author: { name: 'Edgar Allen Poe' } },
              { title: 'Eleonora', stock: 555, author: { name: 'Edgar Allen Poe' } },
              { title: 'Catweazle', stock: 22, author: { name: 'Richard Carpenter' } }
            ]
          },
          Authors: {
            nodes: [
              { name: 'Emily Brontë' },
              { name: 'Charlotte Brontë' },
              { name: 'Edgar Allen Poe' },
              { name: 'Richard Carpenter' }
            ]
          }
        },
        CatalogService: {
          Genres: {
            nodes: [
              { name: 'Fiction' },
              { name: 'Drama' },
              { name: 'Poetry' },
              { name: 'Fantasy' },
              { name: 'Science Fiction' },
              { name: 'Romance' },
              { name: 'Mystery' },
              { name: 'Thriller' },
              { name: 'Dystopia' },
              { name: 'Fairy Tale' },
              { name: 'Non-Fiction' },
              { name: 'Biography' },
              { name: 'Autobiography' },
              { name: 'Essay' },
              { name: 'Speech' }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })

    test('recursive query', async () => {
      const query = gql`
        {
          AdminService {
            Books {
              nodes {
                title
                author {
                  name
                  books {
                    nodes {
                      title
                      author {
                        name
                        books {
                          nodes {
                            title
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
      const data = {
        AdminService: {
          Books: {
            nodes: [
              {
                title: 'Wuthering Heights',
                author: {
                  name: 'Emily Brontë',
                  books: {
                    nodes: [
                      {
                        title: 'Wuthering Heights',
                        author: { name: 'Emily Brontë', books: { nodes: [{ title: 'Wuthering Heights' }] } }
                      }
                    ]
                  }
                }
              },
              {
                title: 'Jane Eyre',
                author: {
                  name: 'Charlotte Brontë',
                  books: {
                    nodes: [
                      {
                        title: 'Jane Eyre',
                        author: { name: 'Charlotte Brontë', books: { nodes: [{ title: 'Jane Eyre' }] } }
                      }
                    ]
                  }
                }
              },
              {
                title: 'The Raven',
                author: {
                  name: 'Edgar Allen Poe',
                  books: {
                    nodes: [
                      {
                        title: 'The Raven',
                        author: {
                          name: 'Edgar Allen Poe',
                          books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] }
                        }
                      },
                      {
                        title: 'Eleonora',
                        author: {
                          name: 'Edgar Allen Poe',
                          books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] }
                        }
                      }
                    ]
                  }
                }
              },
              {
                title: 'Eleonora',
                author: {
                  name: 'Edgar Allen Poe',
                  books: {
                    nodes: [
                      {
                        title: 'The Raven',
                        author: {
                          name: 'Edgar Allen Poe',
                          books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] }
                        }
                      },
                      {
                        title: 'Eleonora',
                        author: {
                          name: 'Edgar Allen Poe',
                          books: { nodes: [{ title: 'The Raven' }, { title: 'Eleonora' }] }
                        }
                      }
                    ]
                  }
                }
              },
              {
                title: 'Catweazle',
                author: {
                  name: 'Richard Carpenter',
                  books: {
                    nodes: [
                      {
                        title: 'Catweazle',
                        author: { name: 'Richard Carpenter', books: { nodes: [{ title: 'Catweazle' }] } }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      }
      const response = await POST('/graphql', { query })
      expect(response.data).toEqual({ data })
    })
  })
})
