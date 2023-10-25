service EntityNameClashService {
  entity My_Entity {
    key ID       : UUID;
        elementA : String;
  }

  entity My.Entity {
    key ID       : UUID;
        elementB : String;
  }
}
