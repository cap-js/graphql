const ensureError = error => (error instanceof Error ? error : new Error(error))

module.exports = { ensureError }
