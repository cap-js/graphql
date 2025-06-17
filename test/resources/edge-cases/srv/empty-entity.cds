@graphql
service EmptyEntityService {
  entity NonEmptyEntity {
    key ID : UUID;
  }

  entity EmptyEntity {}
}
