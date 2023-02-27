const { GraphQLError, print } = require('graphql')

const ISO_TIME_NO_MILLIS = '(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d'

const ISO_TIME_REGEX = new RegExp(`^${ISO_TIME_NO_MILLIS}$`, 'i')

const _isValueNode = value => value.kind

const getValueFromInputValueOrValueNode = value => (_isValueNode(value) ? value.value : value)

const getGraphQLValueError = (message, inputValueOrValueNode) => {
  const valueNode = _isValueNode(inputValueOrValueNode) && inputValueOrValueNode
  const value = getValueFromInputValueOrValueNode(inputValueOrValueNode)
  const formattedValue = valueNode ? print(valueNode) : typeof value === 'string' ? '"' + value + '"' : value
  return new GraphQLError(`${message}: ${formattedValue}`, valueNode)
}

const validateRange = (num, min, max, errorMessage, valueNode) => {
  if (num > max || num < min) throw getGraphQLValueError(errorMessage, valueNode || num)
}

const parseDate = (inputValueOrValueNode, errorMessage) => {
  const value = getValueFromInputValueOrValueNode(inputValueOrValueNode)
  try {
    return new Date(value).toISOString()
  } catch (e) {
    throw getGraphQLValueError(errorMessage, inputValueOrValueNode)
  }
}

module.exports = {
  ISO_TIME_REGEX,
  getValueFromInputValueOrValueNode,
  getGraphQLValueError,
  validateRange,
  parseDate
}
