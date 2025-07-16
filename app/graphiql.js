const path = require('path')
const express = require('express')
const router = express.Router()
const fs = require('node:fs')

const graphiql = {
  get html() {
    const value = fs.readFileSync(path.join(__dirname, 'graphiql.html'))
    Object.defineProperty(this, 'html', { value })
    return value
  }
}

router.get('/', (req, res, next) => {
  if (req.query.query) {
    // Forward GET requests with query URL parameter to GraphQL server
    next()
  } else {
    res.type('html').send(graphiql.html)
  }
})

module.exports = router
