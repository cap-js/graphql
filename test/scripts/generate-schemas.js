#!/usr/bin/env node
const cds = require('@sap/cds')
// Load @cap-js/graphql plugin to ensure .to.gql and .to.graphql compile targets are registered
require('../../cds-plugin')
const path = require('path')
const fs = require('fs')
const { SCHEMAS_DIR } = require('../util')
const { models } = require('../resources')

;(async () => {
  fs.rmSync(SCHEMAS_DIR, { recursive: true, force: true })
  fs.mkdirSync(SCHEMAS_DIR)
  for (const model of models) {
    console.log(`Generating GraphQL schema "${model.name}.gql"`)
    const csn = await cds.load(model.files, { docs: true })
    const graphQLSchema = cds.compile(csn).to.gql({ sort: true })
    const schemaPath = path.join(SCHEMAS_DIR, `${model.name}.gql`)
    const schemaPathDir = path.parse(schemaPath).dir
    if (!fs.existsSync(schemaPathDir)) fs.mkdirSync(schemaPathDir)
    fs.writeFileSync(schemaPath, graphQLSchema)
  }
})()
