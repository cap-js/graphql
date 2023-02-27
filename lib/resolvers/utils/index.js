const _ensureError = error => (error instanceof Error ? error : new Error(error))

const setResponse = async (response, key, value) => {
  try {
    response[key] = await value
  } catch (e) {
    response[key] = _ensureError(e)
  }
}

module.exports = { setResponse }
