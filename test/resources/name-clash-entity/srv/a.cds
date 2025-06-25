@graphql
service EntityNameClashService {
  entity ![Ro.ot] {
    key ID : UUID;
        b  : String;
  }

  entity ![Ro_ot] {
    key ID : UUID;
        a  : String;
  }

}
