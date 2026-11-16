const fs = require('fs')
const path = require('path')
const cds = require('@sap/cds')
// Load @cap-js/graphql plugin to ensure .to.gql and .to.graphql compile targets are registered
require('../../cds-plugin')

const { models } = require('../resources')
const { SCHEMAS_DIR } = require('../util')
const { printSchema, validateSchema } = require('graphql')

describe('graphql - schema generation', () => {
  describe('generated schema should match saved schema', () => {
    models.forEach(model => {
      it('should process model ' + model.name, async () => {
        const csn = await cds.load(model.files, { docs: true })
        const generatedSchemaObject = cds.compile(csn).to.graphql({ as: 'obj', sort: true })
        const schemaValidationErrors = validateSchema(generatedSchemaObject)
        expect(schemaValidationErrors.length).toEqual(0)

        let loadedSchema = fs.readFileSync(path.join(SCHEMAS_DIR, `${model.name}.gql`), 'utf-8')
        const [major, minor] = cds.version.split('.').map(Number)
        if (major > 10 || (major === 10 && minor >= 3)) {
          loadedSchema = loadedSchema.replace(
            /"""\n(Code list for currencies)\n\nSee https:\/\/cap\.cloud\.sap\/docs\/cds\/common#entity-currencies\n"""/g,
            '"""$1"""'
          )
        }

        const generatedSchema = printSchema(generatedSchemaObject)
        expect(generatedSchema).toEqual(loadedSchema)
      })
    })
  })
})
