const path = require('path')
const express = require('express')
const router = express.Router()
const fs = require('node:fs')

const html = fs.readFileSync(path.join(__dirname, 'graphiql.html'))

router.get('/', async (req, res, next) => {
  // Forward GET requests with query URL parameter to GraphQL server
  if (req.query.query) next()
  else res.type('html').send(html)
})

module.exports = router
