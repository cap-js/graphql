# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version 0.5.0 - tbd

### Added

### Changed

- Improved consistency of handling results of different types returned by custom handlers in CRUD resolvers:
  + Wrap only objects (i.e. not primitive types or arrays) returned by custom handlers in arrays in create, read, and update resolvers
  + Delete mutations return the length of an array that is returned by a `DELETE` custom handler or 1 if a single object is returned
- Don't generate fields for key elements in update input objects

### Fixed

### Removed

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
