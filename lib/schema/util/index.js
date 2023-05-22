const hasScalarFields = entity =>
  Object.entries(entity.elements).some(
    ([, el]) => !(shouldElementBeIgnored(el) || el.isAssociation || el.isComposition)
  )

const _isLocalized = element => element.name === 'localized' && element.target?.endsWith('.texts')

const shouldElementBeIgnored = element => element.name.startsWith('up_') || _isLocalized(element)

const isCompositionOfAspect = entity =>
  Object.values(entity.elements.up_?._target.elements ?? {}).some(e => e.targetAspect && e._target.name === entity.name)

module.exports = { hasScalarFields, shouldElementBeIgnored, isCompositionOfAspect }
