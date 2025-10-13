@graphql
service EmptyEntityService {
  entity NonEmptyEntity {
    key ID : UUID;
  }

  entity EmptyEntity {}
}

@graphql
service WillBecomeEmptyService {
  entity EmptyEntity {}
}
