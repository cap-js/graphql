using {UserService} from '../../bookshop/srv/user-service';

@graphql
extend service UserService with {
  // TODO: move to separate test project
  @odata.singleton.nullable
  entity nullableSingleton {
    value : String;
  };
}
