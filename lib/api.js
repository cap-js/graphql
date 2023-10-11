const cds = require('@sap/cds')

const TARGETS = ['gql', 'graphql']

function _lazyRegisterCompileTargets() {
  const value = require('./compile')
  TARGETS.forEach(target => Object.defineProperty(this, target, { value }))
  return value
}

// Register gql and graphql as cds.compile.to targets
const registerCompileTargets = () => {
  TARGETS.forEach(target =>
    Object.defineProperty(cds.compile.to, target, {
      get: _lazyRegisterCompileTargets,
      configurable: true
    })
  )
}

module.exports = { registerCompileTargets }
