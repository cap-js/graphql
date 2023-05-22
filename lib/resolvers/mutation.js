const { executeCreate, executeUpdate, executeDelete } = require('./crud')
const { setResponse } = require('./response')

module.exports = async (context, service, entity, field) => {
  const response = {}

  for (const selection of field.selectionSet.selections) {
    const operation = selection.name.value
    const responseKey = selection.alias?.value || operation

    const executeOperation = { create: executeCreate, update: executeUpdate, delete: executeDelete }[operation]
    const value = executeOperation(context, service, entity, selection)
    await setResponse(context, response, responseKey, value)
  }

  return response
}
