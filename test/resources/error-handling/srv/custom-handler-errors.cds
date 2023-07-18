@protocol: [
  'odata-v4',
  'graphql'
]
service CustomHandlerErrorsService {
  entity A {
    key id : Integer;
  }

  entity B {
    key id : Integer;
  }

  entity C {
    key id : Integer;
  }

  entity D {
    key id : Integer;
  }

  entity E {
    key id : Integer;
  }

  entity Orders {
    key id       : Integer;
        stock    : Integer;
        quantity : Integer;
  }

  entity Z {
    key id : Integer;
  }
}
