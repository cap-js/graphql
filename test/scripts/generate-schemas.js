#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { SCHEMAS_DIR, cdsFilesToGQLSchema, formatSchema } = require('../util')
const { models } = require('../resources')
const { printSchema } = require('graphql')

;(async () => {
  fs.rmSync(SCHEMAS_DIR, { recursive: true, force: true })
  fs.mkdirSync(SCHEMAS_DIR)
  for (const model of models) {
    console.log(`Generating GraphQL schema "${model.name}.gql"`)
    const graphQLSchema = await formatSchema(printSchema(await cdsFilesToGQLSchema(model.files)))
    const schemaPath = path.join(SCHEMAS_DIR, `${model.name}.gql`)
    const schemaPathDir = path.parse(schemaPath).dir
    if (!fs.existsSync(schemaPathDir)) fs.mkdirSync(schemaPathDir)
    fs.writeFileSync(schemaPath, graphQLSchema)
  }
})()
