const cds = require('@sap/cds')
const LOG = cds.log('graphql')
const { createHandler: createRawHandler } = require('graphql-http')

const createHandler = options => {
  // This function creates the GraphQL context of a request, that is passed to resolvers, by
  // merging the GraphQL context that has been created by GraphQLAdapter, which contains e.g.
  // errorFormatter, with the request context, which contains req and res of the current request.
  const context = req => ({ ...options.context, ...req.context  })

  const handle = createRawHandler({ ...options, context })

  const handler = async (req, res) => {
    const { url, method, headers, body } = req
    const raw = req
    // Request context, not graphql context
    const context = { req, res }
    try {
      const [resBody, init] = await handle({ url, method, headers, body, raw, context })

      if (res.headersSent) return
      res.writeHead(init.status, init.statusText, init.headers).end(resBody)
    } catch (e) {
      LOG.error('Internal error occurred during GraphQL request handling.', e)
    }
  }

  return handler
}

module.exports = createHandler