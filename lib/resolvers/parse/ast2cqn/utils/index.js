const getArgumentByName = (args, name) => args.find(arg => arg.name.value === name)

module.exports = { getArgumentByName }
