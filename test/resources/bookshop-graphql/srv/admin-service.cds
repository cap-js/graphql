using {sap.capire.graphql} from '../db/schema';
using {AdminService} from '../../bookshop/srv/admin-service';

@graphql
/** Service used by administrators to manage Books and Authors */
extend service AdminService with {
  entity Chapters as projection on graphql.Chapters;
}
