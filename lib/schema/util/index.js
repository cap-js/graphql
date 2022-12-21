const hasScalarFields = entity =>
  Object.entries(entity.elements).some(
    ([, el]) => !(shouldElementBeIgnored(el) || el.isAssociation || el.isComposition)
  )

const _isLocalized = element => element.name === 'localized' && element.target?.endsWith('.texts')

const shouldElementBeIgnored = element => element.name.startsWith('up_') || _isLocalized(element)

module.exports = { hasScalarFields, shouldElementBeIgnored }
