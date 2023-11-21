const { handleCDSError } = require('./error')

const setResponse = async (context, response, key, value) => {
  try {
    response[key] = await value
  } catch (error) {
    response[key] = handleCDSError(context, error)
  }
}

module.exports = { setResponse }
