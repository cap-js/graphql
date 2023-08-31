const { handleCDSError } = require('./error')

const setResponse = async (context, response, key, value) => {
  try {
    response[key] = await value
  } catch (e) {
    response[key] = handleCDSError(context, e)
  }
}

module.exports = { setResponse }
