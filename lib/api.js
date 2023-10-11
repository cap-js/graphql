const cds = require('@sap/cds')

const TARGETS = ['gql', 'graphql']

let _compileTargetsRegistered = false

function _lazyRegisterCompileTargets() {
  const value = require('./compile')
  TARGETS.forEach(target => Object.defineProperty(this, target, { value }))
  return value
}

// Register gql and graphql as cds.compile.to targets
const registerCompileTargets = () => {
  // This function needs to be called from two different locations:
  // - `./cds-plugin.js` -> necessary for non-programmatic usage via the `cds compile -2 ...` command
  // - `./lib/GraphQLAdapter.js` -> necessary for programmatic usage, when not loading GraphQLAdapter as a cds-plugin
  // Ensure registration only happens once
  if (_compileTargetsRegistered) return
  TARGETS.forEach(target =>
    Object.defineProperty(cds.compile.to, target, {
      get: _lazyRegisterCompileTargets,
      configurable: true
    })
  )
  _compileTargetsRegistered = true
}

module.exports = { registerCompileTargets }
