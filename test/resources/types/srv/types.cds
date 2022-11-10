
using { sap.cds.graphql.types as my } from '../db/schema';
service TypesService {
  entity MyEntity as projection on my.MyEntity;
}