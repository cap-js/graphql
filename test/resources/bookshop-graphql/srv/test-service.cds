@graphql
service TestService {
  entity Foo {
    key ID : Integer;
    bar : String;
  }
  function hello (to:String) returns String;
  action cancelOrder ( orderID:Integer, reason:String );
  function getFoo () returns Foo;
  function getFoos () returns array of Foo;
  function getInts () returns array of Integer;
}
