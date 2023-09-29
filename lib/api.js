function _registerLazy() {
  const value = require('./compile')
  Object.defineProperties(this, {
    gql: { value },
    graphql: { value }
  })
  return value
}

const registerCompileTargets = cds_compile_to => {
  // Register gql and graphql as cds.compile.to targets
  Object.defineProperties(cds_compile_to, {
    gql: {
      get: _registerLazy,
      configurable: true
    },
    graphql: {
      get: _registerLazy,
      configurable: true
    }
  })
}

module.exports = { registerCompileTargets }
