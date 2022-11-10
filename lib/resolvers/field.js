// The GraphQL.js defaultFieldResolver does not support returning aliased values that resolve to fields with aliases
module.exports = (source, args, context, info) => {
  const responseKey = info.fieldNodes[0].alias ? info.fieldNodes[0].alias.value : info.fieldName
  return source[responseKey]
}
