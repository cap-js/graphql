const path = require('path')
const express = require('express')
const router = express.Router()
const { readFile } = require('node:fs/promises')

let html

const graphiql = async next => {
  if (!html) {
    try {
      html = await readFile(path.join(__dirname, 'graphiql.html'))
    } catch (e) {
      next(new Error(`Failed to read GraphiQL HTML from file`, { cause: e }))
    }
  }
  return html
}

router.get('/', async (req, res, next) => {
  // Forward GET requests with query URL parameter to GraphQL server
  if (req.query.query) return next()
  res.type('html').send(await graphiql(next))
})

module.exports = router
