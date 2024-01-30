const hasScalarFields = entity =>
  Object.entries(entity.elements).some(
    ([, el]) => !(shouldElementBeIgnored(el) || el.isAssociation || el.isComposition)
  )

const _isFlatForeignKey = element => Boolean(element['@odata.foreignKey4'] || element._foreignKey4)

const _isLocalized = element => element.name === 'localized' && element.target?.endsWith('.texts')

// TODO: add check for @cds.api.ignore
const shouldElementBeIgnored = element =>
  element.name.startsWith('up_') || _isLocalized(element) || _isFlatForeignKey(element)

const isCompositionOfAspect = entity =>
  Object.values(entity.elements.up_?._target.elements ?? {}).some(e => e.targetAspect && e._target.name === entity.name)

module.exports = { hasScalarFields, shouldElementBeIgnored, isCompositionOfAspect }
