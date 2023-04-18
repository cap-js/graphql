const path = require('path')

module.exports = (req, res, next) => {
  if (req.query.query) {
    // Forward GET requests with query URL parameter to GraphQL server
    next()
  } else {
    res.sendFile(path.join(__dirname, 'graphiql.html'))
  }
}
