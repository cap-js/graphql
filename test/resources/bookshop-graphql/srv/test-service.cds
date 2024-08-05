@graphql
service TestService {
  entity Foo {
    key ID : Integer;
    bar : String;
  }
   type cancelOrderRet {
    acknowledge: String enum { succeeded; failed; };
    message: String;
  }
  action noReturn();
  function hello (to:String) returns String;
  action cancelOrder ( orderID:Integer, reason:String ) returns cancelOrderRet;
  function getFoo () returns Foo;
  function getFoos () returns array of Foo;
  function getInts () returns array of Integer;
  action submitFoo (foo:Foo) returns Foo;
  action submitFoos (foo:many Foo) returns array of Foo;
}
