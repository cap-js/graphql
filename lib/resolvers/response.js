const error = require("./error")

const setResponse = async (context, response, key, value) => {
  try {
    response[key] = await value
  } catch (e) {
    response[key] = error(context, e)
  }
}

module.exports = { setResponse }
