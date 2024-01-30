@protocol: ['graphql']
service CompositionOfAspectService {
  entity Books {
    key id       : UUID;
        chapters : Composition of many Chapters;
        reviews  : Composition of many {
                     key id : UUID;
                   }
  }

  aspect Chapters {
    key id : UUID;
  }
}
