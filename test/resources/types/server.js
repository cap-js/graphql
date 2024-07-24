cds.on('bootstrap', app => {
  app.use(cds.env.protocols.graphql.path, require('express').json({ limit: '110KB' }))
})