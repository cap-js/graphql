const TARGETS = ['gql', 'graphql']

function _lazyRegisterCompileTargets() {
  const value = require('./compile')
  TARGETS.forEach(target => Object.defineProperty(this, target, { value }))
  return value
}

// Register gql and graphql as cds.compile.to targets
const registerCompileTargets = cds_compile_to =>
  TARGETS.forEach(target =>
    Object.defineProperty(cds_compile_to, target, {
      get: _lazyRegisterCompileTargets,
      configurable: true
    })
  )

module.exports = { registerCompileTargets }
