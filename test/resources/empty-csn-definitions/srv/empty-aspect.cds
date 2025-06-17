@graphql
service EmptyAspectService {
  entity Root {
    key ID           : UUID;
        emptyAspect  : Composition of EmptyAspect;
        emptyAspects : Composition of many EmptyAspect;
  }

  aspect EmptyAspect {}
}
