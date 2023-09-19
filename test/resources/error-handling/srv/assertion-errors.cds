@graphql
service ValidationErrorsService {
  entity A {
    key id        : Integer;
        notEmptyI : Integer @mandatory;
  }

  entity B {
    key id        : Integer;
        notEmptyI : Integer @mandatory;
        notEmptyS : String  @mandatory;
  }

  entity C {
    key id              : Integer;
        inRange         : Integer  @mandatory  @assert.range: [
          0,
          3
        ];
        oneOfEnumValues : String   @assert.range enum {
          high;
          medium;
          low;
        };
  }
}
