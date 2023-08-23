#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { SCHEMAS_DIR, formatSchema } = require('../util')
const { models } = require('../resources')
const compile = require('../../lib/compile')

;(async () => {
  fs.rmSync(SCHEMAS_DIR, { recursive: true, force: true })
  fs.mkdirSync(SCHEMAS_DIR)
  for (const model of models) {
    console.log(`Generating GraphQL schema "${model.name}.gql"`)
    const graphQLSchema = formatSchema(compile(await cds.load(model.files)))
    const schemaPath = path.join(SCHEMAS_DIR, `${model.name}.gql`)
    const schemaPathDir = path.parse(schemaPath).dir
    if (!fs.existsSync(schemaPathDir)) fs.mkdirSync(schemaPathDir)
    fs.writeFileSync(schemaPath, graphQLSchema)
  }
})()
