
using { sap.cds.graphql.types as my } from '../db/schema';
@graphql
service TypesService {
  entity MyEntity as projection on my.MyEntity;
}