const fs = require('fs')
const path = require('path')
const semver = require('semver')
const cdsVersion = require('@sap/cds').version

let { models } = require('../resources')
models = models.filter(m => !m.requires_cds || semver.satisfies(cdsVersion, m.requires_cds))

const { SCHEMAS_DIR, cdsFilesToGQLSchema, formatSchema } = require('../util')
const { printSchema, validateSchema } = require('graphql')

describe('graphql - schema generation', () => {
  describe('generated schema should match saved schema', () => {
    models.forEach(model => {
      it('should process model ' + model.name, async () => {
        const generatedSchemaObject = await cdsFilesToGQLSchema(model.files)
        const schemaValidationErrors = validateSchema(generatedSchemaObject)
        expect(schemaValidationErrors.length).toEqual(0)

        const loadedSchema = formatSchema(fs.readFileSync(path.join(SCHEMAS_DIR, `${model.name}.gql`), 'utf-8'))
        const generatedSchema = formatSchema(printSchema(generatedSchemaObject))
        expect(loadedSchema).toEqual(generatedSchema)
      })
    })
  })
})
