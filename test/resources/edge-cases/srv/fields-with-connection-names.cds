@graphql
service FieldsWithConnectionNamesService {
  entity Root {
    key ID         : UUID;
        nodes      : Composition of Nodes;
        totalCount : String;
  }

  entity Nodes {
    key ID         : UUID;
        nodes      : String;
        totalCount : String;
  }
}
