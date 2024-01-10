@graphql
service RequestService {
  entity A {
    key id        : UUID;
        my_header : String;
  }

  entity B {
    key id : UUID;
  }

  entity C {
    key id : UUID;
  }
}
