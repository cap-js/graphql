service NotAnnotated {
  entity A {
    key id : UUID;
  }
}

@graphql
service AnnotatedWithAtGraphQL {
  entity A {
    key id : UUID;
  }
}

@protocol: 'graphql'
service AnnotatedWithAtProtocolString {
  entity A {
    key id : UUID;
  }
}

@protocol: ['graphql']
service AnnotatedWithAtProtocolStringList {
  entity A {
    key id : UUID;
  }
}

@protocol: [{kind: 'graphql'}]
service AnnotatedWithAtProtocolObjectList {
  entity A {
    key id : UUID;
  }
}
