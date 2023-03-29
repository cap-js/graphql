const { executeCreate, executeUpdate, executeDelete } = require('./crud')
const { setResponse } = require('./utils')

module.exports = async (req, service, entity, field) => {
  const response = {}

  for (const selection of field.selectionSet.selections) {
    const operation = selection.name.value
    const responseKey = selection.alias?.value || operation

    const executeOperation = { create: executeCreate, update: executeUpdate, delete: executeDelete }[operation]
    const value = executeOperation(req, service, entity, selection)
    await setResponse(response, responseKey, value)
  }

  return response
}
