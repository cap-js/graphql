service ElementNameClashService {
  entity MyEntity {
    key ID         : UUID;
        my_Element : String;
        my$Element : String;
  }
}
