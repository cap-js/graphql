@graphql
service FieldNamedLocalizedService {
  entity Root {
    key ID        : Integer;
        // The resulting GraphQL schema should contain a field named
        // "localized" since it is a user modelled association and not an
        // automatically generated association that points to translated texts
        localized : Association to many localized
                      on localized.root = $self;
  }

  entity localized {
    key ID        : Integer;
        root      : Association to Root;
        localized : String; // to test that a property only named 'localized' is not confused with localized keyword
  }
}
