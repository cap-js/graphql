const { Kind } = require('graphql')

const _getFragmentDefinitionForFragmentSpread = (info, fragmentSpread) => info.fragments[fragmentSpread.name.value]

const _substituteFragment = (info, fragmentSpread) =>
  _getFragmentDefinitionForFragmentSpread(info, fragmentSpread).selectionSet.selections

const fragmentSpreadSelections = (info, selections) =>
  selections.flatMap(selection =>
    selection.kind === Kind.FRAGMENT_SPREAD ? _substituteFragment(info, selection) : selection
  )

module.exports = fragmentSpreadSelections
