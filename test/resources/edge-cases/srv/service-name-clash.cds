service Service_NameClashService {
  entity EntityA {
    key ID : UUID;
  }
}

service Service.NameClashService {
  entity EntityB {
    key ID : UUID;
  }
}
