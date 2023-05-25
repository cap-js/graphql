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
service AnnotatedWithAtProtcolString {
  entity A {
    key id : UUID;
  }
}

@protocol: ['graphql']
service AnnotatedWithAtProtcolStringList {
  entity A {
    key id : UUID;
  }
}

@protocol: [{kind: 'graphql'}]
service AnnotatedWithAtProtcolObjectList {
  entity A {
    key id : UUID;
  }
}
