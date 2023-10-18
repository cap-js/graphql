const { visit, Kind } = require('graphql')
const fragmentSpreadSelections = require('./fragment')
const substituteVariable = require('./variable')
const parseLiteral = require('./literal')

module.exports = info => {
  const rootTypeName = info.parentType.name
  const rootType = info.schema.getType(rootTypeName)
  const rootFields = rootType.getFields()

  const enrichedAST = visit(info.fieldNodes, {
    [Kind.SELECTION_SET](node) {
      // Substitute fragment spreads with fragment definitions into the AST as if they were inline fields
      // Prevents the necessity for special handling of fragments in AST to CQN

      // Note: FragmentSpread visitor function cannot be used to replace fragment spreads with fragment definitions
      // that contain multiple top level selections, since those must be placed directly into the selection set
      node.selections = fragmentSpreadSelections(info, node.selections)
    },
    [Kind.FIELD](node) {
      // Remove __typename from selections to prevent field from being interpreted as DB column
      // Instead let graphql framework determine the type
      if (node.name?.value === '__typename') return null
    },
    // Literals within the AST have not yet been parsed
    [Kind.ARGUMENT]: parseLiteral(rootFields),
    // Literals within the AST have not yet been parsed
    [Kind.OBJECT_FIELD]: parseLiteral(rootFields),
    [Kind.VARIABLE](node) {
      // Substitute variable values into the AST as if they were literal values
      // Prevents the necessity for special handling of variables in AST to CQN
      return substituteVariable(info, node)
    },
    [Kind.NULL](node) {
      // Convenience value for handling of null values in AST to CQN
      node.value = null
    }
  })

  return enrichedAST
}
