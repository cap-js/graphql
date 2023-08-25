#!/usr/bin/env node
const cds = require('@sap/cds')
const path = require('path')
const fs = require('fs')
const { SCHEMAS_DIR, formatSchema } = require('../util')
const { models } = require('../resources')
const cds_compile_to_gql = require('../../lib/compile')

;(async () => {
  fs.rmSync(SCHEMAS_DIR, { recursive: true, force: true })
  fs.mkdirSync(SCHEMAS_DIR)
  for (const model of models) {
    console.log(`Generating GraphQL schema "${model.name}.gql"`)
    const graphQLSchema = formatSchema(cds_compile_to_gql(await cds.load(model.files), { sort: true }))
    const schemaPath = path.join(SCHEMAS_DIR, `${model.name}.gql`)
    const schemaPathDir = path.parse(schemaPath).dir
    if (!fs.existsSync(schemaPathDir)) fs.mkdirSync(schemaPathDir)
    fs.writeFileSync(schemaPath, graphQLSchema)
  }
})()
