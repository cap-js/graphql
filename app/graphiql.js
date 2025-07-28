const path = require('path')
const express = require('express')
const router = express.Router()
const fs = require('node:fs')

const html = fs.readFileSync(path.join(__dirname, 'graphiql.html'))

router.get('/', async (req, res, next) => {
  if (req.query.query) {
    // Forward GET requests with query URL parameter to GraphQL server
    next()
  } else {
    res.type('html').send(html)
  }
})

module.exports = router
