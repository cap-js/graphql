const { Kind } = require('graphql')

// graphql@17 returns `undefined` instead of `[]` for a field/directive with no arguments
const getArgumentByName = (args, name) =>
  args?.find(arg => arg.value && arg.name.value === name && arg.value.kind !== Kind.NULL)

module.exports = { getArgumentByName }
