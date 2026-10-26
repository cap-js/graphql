const objectToAST = require('./fromObject')

// graphql@17 nests coerced runtime variable values under `.coerced`; graphql@16 exposes them directly
const _getVariableValueForVariable = (info, variable) => {
  const variableValues = info.variableValues.coerced ?? info.variableValues
  return variableValues[variable.name.value]
}

const substituteVariable = (info, variable) => objectToAST(_getVariableValueForVariable(info, variable))

module.exports = substituteVariable
