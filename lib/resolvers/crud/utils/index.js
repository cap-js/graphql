const _objectStructureToEntityStructure = (service, entity, entry) => {
  for (const [k, v] of Object.entries(entry)) {
    const element = entity.elements[k]
    if (element.isComposition || element.isAssociation) {
      if (Array.isArray(v) && element.is2one) {
        entry[k] = v[0]
      } else if (!Array.isArray(v) && element.is2many) {
        entry[k] = [v]
      }
      entriesStructureToEntityStructure(service, element._target, v)
    }
  }
  return entry
}

const entriesStructureToEntityStructure = (service, entity, entries) => {
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      _objectStructureToEntityStructure(service, entity, entry)
    }
  } else {
    _objectStructureToEntityStructure(service, entity, entries)
  }
  return entries
}

module.exports = { entriesStructureToEntityStructure }
