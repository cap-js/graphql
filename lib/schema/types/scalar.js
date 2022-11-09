const { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } = require('graphql')
const {
  GraphQLBinary,
  GraphQLDate,
  GraphQLDateTime,
  GraphQLDecimal,
  GraphQLInt16,
  GraphQLInt64,
  GraphQLTime,
  GraphQLTimestamp,
  GraphQLUInt8
} = require('./custom')

const CDS_TO_GRAPHQL_TYPES = {
  'cds.Binary': GraphQLBinary,
  'cds.Boolean': GraphQLBoolean,
  'cds.Date': GraphQLDate,
  'cds.DateTime': GraphQLDateTime,
  'cds.Decimal': GraphQLDecimal,
  'cds.DecimalFloat': GraphQLFloat,
  'cds.Double': GraphQLFloat,
  'cds.Int16': GraphQLInt16,
  'cds.Int32': GraphQLInt,
  'cds.Int64': GraphQLInt64,
  'cds.Integer': GraphQLInt,
  'cds.Integer64': GraphQLInt64,
  'cds.LargeBinary': GraphQLBinary,
  'cds.LargeString': GraphQLString,
  'cds.String': GraphQLString,
  'cds.Time': GraphQLTime,
  'cds.Timestamp': GraphQLTimestamp,
  'cds.UInt8': GraphQLUInt8,
  'cds.UUID': GraphQLID
}

module.exports = { cdsToGraphQLScalarType: element => CDS_TO_GRAPHQL_TYPES[element._type] }
