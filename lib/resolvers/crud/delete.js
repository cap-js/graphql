const cds = require('@sap/cds/lib')
const { DELETE } = cds.ql
const { ARGS } = require('../../constants')
const { getArgumentByName, astToWhere } = require('../parse/ast2cqn')

module.exports = async (context, service, entity, selection) => {
  let query = DELETE.from(entity)

  const filter = getArgumentByName(selection.arguments, ARGS.filter)
  if (filter) query.where(astToWhere(filter))

  let result
  try {
    result = await service.dispatch(new cds.Request({ ...{req, res} = context, query }))
  } catch (e) {
    if (e.code === 404) result = 0
    else throw e
  }

  return result
}
