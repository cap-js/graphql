namespace sap.cds.graphql.types; //> important for reflection

entity MyEntity {
      myBinary       : Binary;
      myBoolean      : Boolean;
      myDate         : Date;
      myDateTime     : DateTime;
      myDecimal      : Decimal;
      myDecimalFloat : DecimalFloat;
      myDouble       : Double;
      myInt16        : Int16;
      myInt32        : Int32;
      myInt64        : Int64;
      myInteger      : Integer;
      myInteger64    : Integer64;
      myLargeBinary  : LargeBinary;
      myLargeString  : LargeString;
      myString       : String;
      myTime         : Time;
      myTimestamp    : Timestamp;
      myUInt8        : UInt8;
  key myUUID         : UUID;
}
