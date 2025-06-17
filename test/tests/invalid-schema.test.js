const path = require('path')
// Load @cap-js/graphql plugin to ensure .to.gql and .to.graphql compile targets are registered
require('../../cds-plugin')

const RES = path.join(__dirname, '../resources')

describe('graphql - schema generation fails due to incompatibility with modelling', () => {
  it('special characters in service name', async () => {
    const csn = await cds.load(RES + '/special-chars/srv/service')
    expect(() => {
      cds.compile(csn).to.graphql()
    }).toThrow(/SpecialCharsÄÖÜService/)
  })

  it('special characters in entity name', async () => {
    const csn = await cds.load(RES + '/special-chars/srv/entity')
    expect(() => {
      cds.compile(csn).to.graphql()
    }).toThrow(/RootÄÖÜEntity/)
  })

  it('special characters in element name', async () => {
    const csn = await cds.load(RES + '/special-chars/srv/element')
    expect(() => {
      cds.compile(csn).to.graphql()
    }).toThrow(/myÄÖÜElement/)
  })
})
