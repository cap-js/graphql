# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version 0.11.0 - tbd

### Added

### Changed

### Fixed

### Removed

## Version 0.10.0 - 2023-01-30

### Added

- Support for generating GraphQL descriptions from CDS doc comments of services, entities, and elements
- Support for operator `in` for filtering on lists of values

### Changed

- Bump `@graphiql/plugin-explorer` version to `^1`
- Ignore fields that represent foreign keys in GraphQL schema generation
- When compiling to GraphQL using the CDS API or CLI, only generate GraphQL schemas for services that are annotated with GraphQL protocol annotations

### Fixed

- Name clashes when CDS elements are named `nodes` or `totalCount`
- Parsing of `null` values in lists

## Version 0.9.0 - 2023-11-16

### Added

- Message interpolation of logged errors, transforming error message placeholders into human-readable text (default locale)

### Changed

- Moved registration of `cds.compile.to.gql` and `cds.compile.to.graphql` targets from `@sap/cds` to `@cap-js/graphql`
- Improve merging of custom `graphql` protocol configuration with plugin default configuration
- Errors representing client errors (`4xx` range) are now logged as warnings instead of errors
- Exclude the stack trace of the outer logged error message in multiple error scenarios, as the inner stack trace already contained the precise initial segment of the outer stack trace

### Fixed

- Load custom `errorFormatter` relative to CDS project root
- Fix internal server error when formatting errors that aren't CDS errors (thrown by CDS or in custom handlers) or instances of GraphQLError, such as the error caused by requests with undefined `query` property

## Version 0.8.0 - 2023-10-06

### Added

- [beta] Translate CDS error messages and include additional error properties in `GraphQLError` `extensions`. Only specific allowed properties are exposed when running in production.
- [beta] Option `errorFormatter` that can be pointed to a function that overwrites the default logic of how CDS errors are formatted before they are added to the GraphQL error response. Please note that this may overwrite sanitization logic that is otherwise applied to error messages in production.
- [beta] Logging of errors that occur during query and mutation execution

### Changed

- Bump required `@sap/cds` version to `>=7.3`
- Bump required `graphql-http` version to `^1.18.0`

### Fixed

- Malformed responses for convoluted queries in which parts of results are supposed to be returned multiple times, caused by formatting results in-place

## Version 0.7.0 - 2023-09-04

### Changed

- Omit `variables` from log if it is an empty object

## Version 0.6.2 - 2023-07-12

### Changed

- Pin `graphiql` version to `^3`
- Pin `@graphiql/plugin-explorer` version to `~0.3`

### Fixed

- GraphiQL Explorer Plugin initialization due to upstream implementation pattern change

## Version 0.6.1 - 2023-07-05

### Changed

- Improved query logging:
  + Don't log queries that are `undefined`
  + Log `operationName`
  + Log `variables` when not in production
  + Sanitize arguments and their values in queries when in production

### Fixed

- Changed GraphiQL Explorer Plugin CDN URL due to upstream renaming

## Version 0.6.0 - 2023-06-23

### Added

- Support for `@sap/cds^7` middlewares and protocols. Note: services now need to be annotated with protocol annotations such as `@graphql` or `@protocol: 'graphql'`.

### Changed

- Bump required `@sap/cds` version to `>=7`
- `@cap-js/graphql/index.js` now collects individual services and mounts the adapter as a protocol middleware on the `cds.on('served', ...)` event
- Moved the `GraphQLAdapter` module to `lib/GraphQLAdapter.js` and merged it with `CDSGraphQLAdapter` previously found in `index.js` in the root directory
- Don't generate fields that represent compositions of aspects within mutation types that represent services
- Disabled conjunction on the same field for the following operators:
  + `eq` (Equal)
  + `gt` (Greater Than)
  + `ge` (Greater Than or Equal)
  + `le` (Less Than or Equal)
  + `lt` (Less Than)
  + `startswith`
  + `endswith`

## Version 0.5.0 - 2023-05-04

### Changed

- Improved consistency of handling results of different types returned by custom handlers in CRUD resolvers:
  + Wrap only objects (i.e. not primitive types or arrays) returned by custom handlers in arrays in create, read, and update resolvers
  + Delete mutations return the length of an array that is returned by a `DELETE` custom handler or 1 if a single object is returned
- Don't generate fields for key elements in update input objects
- Update and delete mutations have mandatory `filter` argument
- Allow services that are not instances of `cds.ApplicationService`. It is expected that the invoker provides the correct set of service providers when directly using the GraphQL protocol adapter API.

### Fixed

- Aligned `cds.Request` instantiation with other protocols for more consistent usage in custom handlers

## Version 0.4.1 - 2023-03-29

### Fixed

- `cds-plugin.js` was missing in `files` property of `package.json`

## Version 0.4.0 - 2023-03-29

### Added

- Supporting new `cds-plugin` technique for zero configuration
- Support for filtering by `null` values
- Allow multiple filters on the same field, with the same operator, that are logically joined by `AND`. For example, filtering for all books with titles that contain both strings, "Wuthering" and "Heights":
  ```graphql
  {
    AdminService {
      Books(filter: { title: { contains: ["Wuthering", "Heights"] } }) {
        nodes {
          title
        }
      }
    }
  }
  ```

### Changed

- Improved handling of `null` and `undefined` values in query arguments
- Empty filter lists resolve to `false` and empty filter objects resolve to `true`

### Fixed

- Handling of GraphQL queries that are sent via `GET` requests using the `query` URL parameter if GraphiQL is enabled

## Version 0.3.1 - 2023-02-28

### Fixed

- Add `app` folder to `files` property of `package.json` to be included for publishing to `npm`

## Version 0.3.0 - 2023-02-27

### Changed

- Replaced deprecated GraphQL HTTP server `express-graphql` with `graphql-http`
- Serve GraphiQL 2 via included HTML instead of relying on the server framework (`express-graphql` included GraphiQL 1)
- Bump `graphql` version to 16
- Execute query resolvers in parallel and mutation resolvers serially

## Version 0.2.0 - 2023-01-30

### Changed

- Register `aliasFieldResolver` during schema generation instead of passing it to the GraphQL server
- The filters `contains`, `startswith`, and `endswith` now generate CQN function calls instead of generating `like` expressions directly

### Fixed

- Schema generation crash that occurred if an entity property is named `localized`
- The field `totalCount` could not be queried on its own

## Version 0.1.0 - 2022-12-08

### Added

- To-many relationships are now represented by an additional nesting level which contains the fields `totalCount` and `nodes`. `totalCount` is similar to OData `$count`. `nodes` contains the fields belonging to the entity. This is similar to the GraphQL cursor connection specification, but without an additional second `edges` nesting level. The following shows an example query using the new schema structure:
  ```graphql
  {
    AdminService {
      Books {
        totalCount
        nodes {
          title
        }
      }
    }
  }
  ```
- Support for aliases on fields returned by mutations
- Improved support for aliases on fields that represent compositions and associations (some limitations still apply)
- Include localized `texts` fields of entities in schema generation
- Improve check to skip field `localized` during schema generation

### Changed

- The GraphQL protocol adapter now uses a new middlewares mechanism instead of `cds.plugins` which requires `@sap/cds` version 6.3 to run. Enable the `cds.requires.middlewares` flag and register the GraphQL protocol adapter in `cds.env.protocols` to get started.
- Replaced `debug` level query and mutation logging with improved `info` level request logging
