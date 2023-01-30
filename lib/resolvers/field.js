const { isObjectType, isIntrospectionType } = require('graphql')

// The GraphQL.js defaultFieldResolver does not support returning aliased values that resolve to fields with aliases
function aliasFieldResolver(source, args, contextValue, info) {
  const responseKey = info.fieldNodes[0].alias ? info.fieldNodes[0].alias.value : info.fieldName
  return source[responseKey]
}

const registerAliasFieldResolvers = schema => {
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isObjectType(type) || isIntrospectionType(type)) continue

    for (const field of Object.values(type.getFields())) {
      if (!field.resolve) field.resolve = aliasFieldResolver
    }
  }
}

module.exports = registerAliasFieldResolvers
