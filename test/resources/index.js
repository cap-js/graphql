const path = require('path')

const models = require('./models').map(model => ({
  ...model,
  files: model.files.map(file => path.join(__dirname, file))
}))

module.exports = { models }
