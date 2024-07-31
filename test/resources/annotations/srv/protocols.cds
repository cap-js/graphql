context protocols {
  entity A {
    key id : UUID;
  }
}

service NotAnnotated {
  entity A as projection on protocols.A;
}

@protocol: 'none'
service AnnotatedWithAtProtocolNone {
  entity A as projection on protocols.A;
}

@protocol: 'odata'
service AnnotatedWithNonGraphQL {
  entity A as projection on protocols.A;
}

@graphql
service AnnotatedWithAtGraphQL {
  entity A as projection on protocols.A;
}

@protocol: 'graphql'
service AnnotatedWithAtProtocolString {
  entity A as projection on protocols.A;
}

@protocol: ['graphql']
service AnnotatedWithAtProtocolStringList {
  entity A as projection on protocols.A;
}

@protocol: [{kind: 'graphql'}]
service AnnotatedWithAtProtocolObjectList {
  entity A as projection on protocols.A;
}

@protocol: { graphql }
service AnnotatedWithAtProtocolObjectWithKey {
  entity A as projection on protocols.A;
}

@protocol: { graphql: 'dummy' }
service AnnotatedWithAtProtocolObjectWithKeyAndValue {
  entity A as projection on protocols.A;
}
