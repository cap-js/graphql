@graphql
service ReturnTypesService {
  entity Integer {
    key id     : UUID;
        string : cds.String;
  }

  entity String {
    key id     : UUID;
        string : cds.String;
  }

  entity Object {
    key id     : UUID;
        string : cds.String;
  }

  entity Array {
    key id     : UUID;
        string : cds.String;
  }
}
