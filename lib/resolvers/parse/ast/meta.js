const removeMetaFieldsFromSelections = selections =>
  selections.filter(selection => selection.name.value !== '__typename')

module.exports = removeMetaFieldsFromSelections
