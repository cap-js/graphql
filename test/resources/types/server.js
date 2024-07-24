cds.on('bootstrap', app => {
  // Programmatic override of maximum request body size for requests to GraphQL endpoint
  app.use(cds.env.protocols.graphql.path, require('express').json({ limit: '110KB' }))
})
