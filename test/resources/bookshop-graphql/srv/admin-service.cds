using {sap.capire.graphql} from '../db/schema';
using {AdminService} from '../../bookshop/srv/admin-service';

@graphql
/** Service to administer Books and Authors */
extend service AdminService with {
  entity Chapters as projection on graphql.Chapters;
}
