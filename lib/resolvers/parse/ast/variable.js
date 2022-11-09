const objectToAST = require('./fromObject')

const _getVariableValueForVariable = (info, variable) => info.variableValues[variable.name.value]

const substituteVariable = (info, variable) => objectToAST(_getVariableValueForVariable(info, variable))

module.exports = substituteVariable
