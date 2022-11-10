# SAP Repository Template

Default templates for SAP open source repositories, including LICENSE, .reuse/dep5, Code of Conduct, etc... All repositories on github.com/SAP will be created based on this template.

## To-Do

In case you are the maintainer of a new SAP open source project, these are the steps to do with the template files:

- Check if the default license (Apache 2.0) also applies to your project. A license change should only be required in exceptional cases. If this is the case, please change the [license file](LICENSE).
- Enter the correct metadata for the REUSE tool. See our [wiki page](https://wiki.wdf.sap.corp/wiki/display/ospodocs/Using+the+Reuse+Tool+of+FSFE+for+Copyright+and+License+Information) for details how to do it. You can find an initial .reuse/dep5 file to build on. Please replace the parts inside the single angle quotation marks < > by the specific information for your repository and be sure to run the REUSE tool to validate that the metadata is correct.
- Adjust the contribution guidelines (e.g. add coding style guidelines, pull request checklists, different license if needed etc.)
- Add information about your project to this README (name, description, requirements etc). Especially take care for the <your-project> placeholders - those ones need to be replaced with your project name. See the sections below the horizontal line and [our guidelines on our wiki page](https://wiki.wdf.sap.corp/wiki/display/ospodocs/Guidelines+for+README.md+file) what is required and recommended.
- Remove all content in this README above and including the horizontal line ;)

***

# CDS protocol adapter for GraphQL

## About this project

A GraphQL protocol adapter for [SAP Cloud Application Programming Model](https://cap.cloud.sap) Node.js.
This adapter generically generates a GraphQL schema for the models of an application and serves an endpoint that allows you to query your services using the GraphQL query language.

_**WARNING:** This package is in an early general availability state. This means that it is general available, with stable APIs unless otherwise indicated, and you can use it for production. However, please note the [current limitations](#limitations) listed below._

## Requirements and Setup

1. Add the GraphQL adapter to your project using `npm`. We will publish the package soon and adapt the snippet accordingly:
    ```js
    npm add git+https://github.com/cap-js/cds-adapter-graphql
    ```

2. Enable [middlewares](https://cap.cloud.sap/docs/node.js/middlewares) in your project's `package.json`:
    ```jsonc
    {
      "cds": {
        "requires": {
          "middlewares": true
        }
      }
    }
    ```

3. Add the GraphQL adapter as a protocol middleware to your project's `server.js`:
    ```js
    const cds = require('@sap/cds')
    const path = require('path')

    cds.env.protocols = {
      graphql: { path: '/graphql', impl: '@cap-js/graphql' }
    }
    ```
  
4. Run your server as usual, e.g. using `cds watch`.
> The runtime will automatically serve all services via GraphQL at the default configured endpoint.

## Limitations

- **Actions** and functions are not yet unsupported.
- **CDS annotations** like `@readonly` aren’t considered during schema generation.
- **Cursor-based Pagination** &ndash; we currently support offset-based pagination, and will add cursor-based pagination going forward. While we intend to support both variants then, it is not guaranteed that we can do so without breaking changes to current behaviour.
- **Extensions** are not yet considered.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/cap-js/cds-graphql-adapter/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2022 SAP SE or an SAP affiliate company and cds-graphql-adapter contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/cap-js/cds-graphql-adapter).
