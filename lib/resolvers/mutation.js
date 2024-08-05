const { executeCreate, executeUpdate, executeDelete } = require('./crud')
const astToParameters = require('./parse/ast2cqn/parameters')
const { setResponse } = require('./response')

module.exports = async (context, service, entityOrAction, field) => {
  const response = {}

  const entity = entityOrAction.kind === 'entity' && entityOrAction
  const action = entityOrAction.kind === 'action' && entityOrAction

  if (action) {
    const name = action.name.replace(`${service.name}.`, '')
    const params = astToParameters(field.arguments)
    return service[name](params)
  }

  for (const selection of field.selectionSet.selections) {
    const operation = selection.name.value
    const responseKey = selection.alias?.value || operation

    const executeOperation = { create: executeCreate, update: executeUpdate, delete: executeDelete }[operation]
    const value = executeOperation(context, service, entity, selection)
    await setResponse(context, response, responseKey, value)
  }

  return response
}
