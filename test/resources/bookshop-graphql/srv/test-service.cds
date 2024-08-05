@graphql
service TestService {
  entity Foo {
    key ID : Integer;
    bar : String;
  }
  function hello (to:String) returns String;
  action world();
}
