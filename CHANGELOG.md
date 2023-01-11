# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version 0.2.0 - tbd

### Added

### Changed

- Register `aliasFieldResolver` during schema generation instead of passing it to the GraphQL server

### Fixed	

- Fixed a server crash that occourred if an entity property is named `localized`.

### Removed

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
