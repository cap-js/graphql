using {sap.capire.graphql} from '../db/schema';
using {AdminService} from '../../bookshop/srv/admin-service';

@graphql
extend service AdminService with {
  entity Chapters as projection on graphql.Chapters;
}
