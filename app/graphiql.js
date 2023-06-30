const path = require('path')
const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  if (req.query.query) {
    // Forward GET requests with query URL parameter to GraphQL server
    next()
  } else {
    res.sendFile(path.join(__dirname, 'graphiql.html'))
  }
})

module.exports = router
