using {managed} from '@sap/cds/common';

service FieldNamedLocalizedService {
  entity localized : managed {
    key ID   : Integer;
        root : Association to Root;
  }

  entity Root : managed {
    key ID        : Integer;
        // The resulting GraphQL schema should contain a field named
        // "localized" since it is a user modelled association and not an
        // automatically generated association that points to translated texts
        localized : Association to many localized
                      on localized.root = $self;
  }
}
