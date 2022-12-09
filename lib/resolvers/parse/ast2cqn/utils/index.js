const { Kind } = require('graphql')

const getArgumentByName = (args, name) =>
  args.find(arg => arg.value && arg.name.value === name && arg.value.kind !== Kind.NULL)

module.exports = { getArgumentByName }
