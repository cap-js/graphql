[![REUSE status](https://api.reuse.software/badge/github.com/cap-js/cds-adapter-graphql)](https://api.reuse.software/info/github.com/cap-js/cds-adapter-graphql)

# CDS protocol adapter for GraphQL

## About this project

A GraphQL protocol adapter for [SAP Cloud Application Programming Model](https://cap.cloud.sap) Node.js.
This adapter generically generates a GraphQL schema for the models of an application and serves an endpoint that allows you to query your services using the GraphQL query language.

_**WARNING:** This package is in an early general availability state. This means that it is general available, with stable APIs unless otherwise indicated, and you can use it for production. However, please note the [current limitations](#limitations) listed below._

## Requirements and Setup

1. Simply add the GraphQL adapter to your project using `npm`:
   ```js
   npm add @cap-js/graphql
   ```

> This will automatically plugin to `@sap/cds` runtime, enabling the new [middlewares architecture](https://cap.cloud.sap/docs/node.js/middlewares) in Node.js, and register a GraphQL endpoint at `/graphql` serving all CRUD requests for the application services found in your model. 
  
2. Run your server as usual, e.g. using `cds watch`.
> The runtime will automatically serve all services via GraphQL at the default configured endpoint.

## Limitations

- **Actions** and functions are not yet supported.
- **CDS annotations** like `@readonly` aren’t considered during schema generation.
- **Cursor-based Pagination** &ndash; we currently support offset-based pagination, and will add cursor-based pagination going forward. While we intend to support both variants then, it is not guaranteed that we can do so without breaking changes to current behaviour.
- **Extensions** are not yet considered.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/cap-js/cds-adapter-graphql/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2022 SAP SE or an SAP affiliate company and cds-adapter-graphql contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/cap-js/cds-adapter-graphql).
