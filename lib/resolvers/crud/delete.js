const { DELETE } = require('@sap/cds/lib').ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToWhere } = require('../parse/ast2cqn')
const { isPlainObject } = require('../utils')

module.exports = async (service, entity, selection) => {
  let query = DELETE.from(entity)

  const filter = getArgumentByName(selection.arguments, ARGS.filter)
  if (filter) query.where(astToWhere(filter))

  let result
  try {
    result = await service.run(query)
  } catch (e) {
    if (e.code === 404) result = 0
    else throw e
  }

  // The CDS delete query returns the number of deleted entries
  // However, custom handlers can return non-numeric results for delete
  if (isPlainObject(result)) return 1
  if (Array.isArray(result)) return result.length

  return result
}
