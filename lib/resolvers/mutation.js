const { executeCreate, executeUpdate, executeDelete } = require('./crud')

module.exports = async (service, entity, field) => {
  const response = {}

  for (const selection of field.selectionSet.selections) {
    const operation = selection.name.value
    const responseKey = selection.alias?.value || operation

    const executeOperation = { create: executeCreate, update: executeUpdate, delete: executeDelete }[operation]
    try {
      response[responseKey] = await executeOperation(service, entity, selection)
    } catch (e) {
      response[responseKey] = e
    }
  }

  return response
}
