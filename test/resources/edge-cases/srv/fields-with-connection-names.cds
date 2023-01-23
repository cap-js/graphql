service FieldsWithConnectionNamesService {
  entity Nodes {
    key ID         : UUID;
        nodes      : String;
        totalCount : String;
  }

  entity Root {
    key ID         : UUID;
        nodes      : Composition of Nodes;
        totalCount : String;
  }
}
