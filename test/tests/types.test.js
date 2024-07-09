const { gql } = require('../util')

const _toBase64Url = value => value.replace(/\//g, '_').replace(/\+/g, '-')

const _getTestBuffer = length => {
  const testString = 'Test String! '
  let string = testString.repeat(Math.ceil(length / testString.length)).slice(0, length)
  return Buffer.from(string)
}

const _getMutationForFieldWithLiteralValue = (field, value, quoted) => ({
  query: gql`
    mutation {
      TypesService {
        MyEntity {
          create(input: { ${field}: ${quoted ? '"' + value + '"' : value} }) {
            ${field}
          }
        }
      }
    }
  `
})

const _getMutationAndVariablesForFieldWithVariable = (field, value) => ({
  query: gql`
    mutation ($input: [TypesService_MyEntity_C]!) {
      TypesService {
        MyEntity {
          create(input: $input) {
            ${field}
          }
        }
      }
    }
  `,
  variables: {
    input: { [field]: value }
  }
})

describe('graphql - types parsing and validation', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const fs = require('fs')

  const { axios, POST, data } = cds.test(path.join(__dirname, '../resources/types'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(async () => {
    await data.reset()
  })

  describe('cds.Binary', () => {
    const field = 'myBinary'
    const _fileBuffer = fs.readFileSync(path.join(__dirname, '../resources/types/db/data/test.jpg'))

    describe('input literal', () => {
      test('cds.Binary is correctly parsed from input literal base64 encoded string value', async () => {
        const buffer = _fileBuffer
        const value = _fileBuffer.toString('base64')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: _toBase64Url(value) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from input literal base64url encoded string value', async () => {
        const buffer = _fileBuffer
        const value = _toBase64Url(_fileBuffer.toString('base64'))
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from input literal base64 encoded string value with padding', async () => {
        const buffer = Buffer.from('This is a test string!')
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ=='
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from input literal base64 encoded string value with no padding', async () => {
        const buffer = Buffer.from('This is a test string!')
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ==' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary throws error when input literal is not a string, but an integer', async () => {
        const value = 123
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Binary cannot represent non string value: 123'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Binary is correctly parsed from input literal base64 encoded string value containing non base64 or base64url characters', async () => {
        const value = 'abc.def~123'
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'abcdef12' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from input literal string value containing non-normalized base64 encoding', async () => {
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISF=' // Should be E=
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISE=' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from input literal string value containing base64 encoded string value with excessive padding', async () => {
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ=========='
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ==' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })
    })

    describe('variable value', () => {
      test('cds.Binary is correctly parsed from variable base64 encoded string value', async () => {
        const buffer = _fileBuffer
        const value = _fileBuffer.toString('base64')
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: _toBase64Url(value) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable base64url encoded string value', async () => {
        const buffer = _fileBuffer
        const value = _toBase64Url(_fileBuffer.toString('base64'))
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable base64 encoded string value with padding', async () => {
        const buffer = Buffer.from('This is a test string!')
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ=='
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable base64 encoded string value with no padding', async () => {
        const buffer = Buffer.from('This is a test string!')
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ==' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable string value containing non base64 or base64url characters', async () => {
        const value = 'abc.def~123'
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'abcdef12' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable string value containing non-normalized base64 encoding', async () => {
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISF=' // Should be E=
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISE=' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary is correctly parsed from variable string value containing base64 encoded string value with excessive padding', async () => {
        const value = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ=========='
        const buffer = Buffer.from(value, 'base64url')
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIQ==' }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.Binary throws error when variable value is not a string, but an integer', async () => {
        const value = 123
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 123 at "input.myBinary"; Binary cannot represent non string value: 123'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.Boolean', () => {
    const field = 'myBoolean'
    const value = true

    test('cds.Boolean is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, value, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })

    test('cds.Boolean is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, value)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })
  })

  describe('cds.Date', () => {
    const field = 'myDate'

    describe('input literal', () => {
      test('cds.Date is correctly parsed from input literal string value', async () => {
        const value = '2021-06-27'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Date throws error when input literal is a string containing a non-date value', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Date values must be strings in the ISO 8601 format YYYY-MM-DD: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Date throws error when input literal is not a string, but an integer', async () => {
        const value = 20210627
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Date cannot represent non string value: 20210627'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Date is correctly parsed from variable string value', async () => {
        const value = '2021-06-27'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Date throws error when variable is a string containing a non-date value', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myDate"; Date values must be strings in the ISO 8601 format YYYY-MM-DD: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Date throws error when variable value is not a string, but an integer', async () => {
        const value = 20210627
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 20210627 at "input.myDate"; Date cannot represent non string value: 20210627'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.DateTime', () => {
    const field = 'myDateTime'

    describe('input literal', () => {
      test('cds.DateTime is correctly parsed from input literal UTC datetime string value', async () => {
        const value = '2021-06-27T14:52:23Z'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.DateTime is correctly parsed from input literal non-UTC datetime string value', async () => {
        const value = '2021-06-27T14:52:23+12:34'
        const returnValue = '2021-06-27T02:18:23Z'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: returnValue }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(returnValue)
      })

      test('cds.DateTime throws error when input literal is a string containing a non-datetime value', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'DateTime values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ssTZD: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.DateTime throws error when input literal is not a string, but an integer', async () => {
        const value = 20210627145223
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'DateTime cannot represent non string value: 20210627145223'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.DateTime is correctly parsed from variable UTC datetime string value', async () => {
        const value = '2021-06-27T14:52:23Z'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.DateTime is correctly parsed from variable non-UTC datetime string value', async () => {
        const value = '2021-06-27T14:52:23+12:34'
        const returnValue = '2021-06-27T02:18:23Z'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: returnValue }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(returnValue)
      })

      test('cds.DateTime throws error when variable is a string containing a non-datetime value', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myDateTime"; DateTime values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ssTZD: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.DateTime throws error when variable value is not a string, but an integer', async () => {
        const value = 20210627145223
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 20210627145223 at "input.myDateTime"; DateTime cannot represent non string value: 20210627145223'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.Decimal', () => {
    const field = 'myDecimal'

    describe('input literal', () => {
      test('cds.Decimal is correctly parsed from input literal float value', async () => {
        const number = 123.45
        const value = String(number)
        const body = _getMutationForFieldWithLiteralValue(field, number, false)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(String(result[field])).toEqual(value)
      })

      test('cds.Decimal is correctly parsed from input literal int value', async () => {
        const number = 123
        const value = String(number)
        const body = _getMutationForFieldWithLiteralValue(field, number, false)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(String(result[field])).toEqual(value)
      })

      test('cds.Decimal is correctly parsed from input literal numeric string value', async () => {
        const number = 123.45
        const value = String(number)
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(String(result[field])).toEqual(value)
      })

      test('cds.Decimal correctly determines large input literal numeric string to be a decimal number', async () => {
        const value = '12345678901234567890.01234567890123456789'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(parseFloat(result[field])).toBeGreaterThan(12345678901234560000) // Incorrect sqlite value due to dynamic typing system and rounding errors
      })

      test('cds.Decimal throws error when input literal is not a decimal string, but a boolean', async () => {
        const value = false
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Decimal must be a numeric value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when input literal is non-numeric string value', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Decimal must be a numeric value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when input literal contains non-numeric character embedded in numeric string value', async () => {
        const value = '123.450000000000000000a'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Decimal must be a numeric value: "123.450000000000000000a"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when input literal is a whitespace string', async () => {
        const value = ' '
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Decimal must be a numeric value: " "'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when input literal is a string containing NaN', async () => {
        const value = 'NaN'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Decimal must be a numeric value: "NaN"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when input literal is a string containing Infinity', async () => {
        const value = 'Infinity'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Decimal must be a numeric value: "Infinity"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Decimal is correctly parsed from variable string float value', async () => {
        const number = 123.45
        const value = String(number)
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(String(result[field])).toEqual(value)
      })

      test('cds.Decimal is correctly parsed from variable string int value', async () => {
        const number = 123
        const value = String(number)
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(String(result[field])).toEqual(value)
      })

      test('cds.Decimal correctly determines large numeric string variable to be a decimal number', async () => {
        const value = '12345678901234567890.01234567890123456789'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(parseFloat(result[field])).toBeGreaterThan(12345678901234560000) // Incorrect sqlite value due to dynamic typing system and rounding errors
      })

      test('cds.Decimal throws error when variable value is a float', async () => {
        const number = 123.45
        const body = _getMutationAndVariablesForFieldWithVariable(field, number)
        const message =
          'Variable "$input" got invalid value 123.45 at "input.myDecimal"; Decimal variable value must be represented by a string: 123.45'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when variable value is an int', async () => {
        const number = 123
        const body = _getMutationAndVariablesForFieldWithVariable(field, number)
        const message =
          'Variable "$input" got invalid value 123 at "input.myDecimal"; Decimal variable value must be represented by a string: 123'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when variable value is a whitespace string', async () => {
        const value = ' '
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value " " at "input.myDecimal"; Decimal must be a numeric value: " "'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when variable value is a string containing NaN', async () => {
        const value = 'NaN'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "NaN" at "input.myDecimal"; Decimal must be a numeric value: "NaN"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Decimal throws error when variable value is a string containing Infinity', async () => {
        const value = 'Infinity'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "Infinity" at "input.myDecimal"; Decimal must be a numeric value: "Infinity"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.DecimalFloat', () => {
    const field = 'myDecimalFloat'
    const number = 1234.567
    const value = String(number)

    test('cds.DecimalFloat is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, number, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(String(result[field])).toEqual(value)
    })

    test('cds.DecimalFloat is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, number)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(String(result[field])).toEqual(value)
    })
  })

  describe('cds.Double', () => {
    const field = 'myDouble'
    const number = 1234.567

    test('cds.Double is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, number, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })

    test('cds.Double is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, number)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })
  })

  describe('cds.Int16', () => {
    const field = 'myInt16'

    describe('input literal', () => {
      test('cds.Int16 is correctly parsed from input literal int value', async () => {
        const number = 32767 // Max Int16
        const body = _getMutationForFieldWithLiteralValue(field, number, false)
        const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(number)
      })

      test('cds.Int16 throws error when input literal int value exceeds max value', async () => {
        const number = 32768 // Max Int16 + 1
        const body = _getMutationForFieldWithLiteralValue(field, number, false)
        const message = 'Int16 must be an integer value between -(2^15) and 2^15 - 1: 32768'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when input literal int value exceeds min value', async () => {
        const number = -32769 // Min Int16 - 1
        const body = _getMutationForFieldWithLiteralValue(field, number, false)
        const message = 'Int16 must be an integer value between -(2^15) and 2^15 - 1: -32769'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when input literal is not a number, but a numeric string', async () => {
        const value = '12345'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int16 cannot represent non integer value: "12345"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when input literal is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int16 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when input literal is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Int16 cannot represent non integer value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Int16 is correctly parsed from variable number value', async () => {
        const number = 32767 // Max Int16
        const body = _getMutationAndVariablesForFieldWithVariable(field, number)
        const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(number)
      })

      test('cds.Int16 throws error when variable number value exceeds max value', async () => {
        const number = 32768 // Max Int16 + 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, number)
        const message =
          'Variable "$input" got invalid value 32768 at "input.myInt16"; Int16 must be an integer value between -(2^15) and 2^15 - 1: 32768'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when variable number value exceeds min value', async () => {
        const number = -32769 // Min Int16 - 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, number)
        const message =
          'Variable "$input" got invalid value -32769 at "input.myInt16"; Int16 must be an integer value between -(2^15) and 2^15 - 1: -32769'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when variable value is not a number, but a numeric string', async () => {
        const value = '12345'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "12345" at "input.myInt16"; Int16 cannot represent non integer value: "12345"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when variable value is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myInt16"; Int16 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Int16 throws error when variable value is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value false at "input.myInt16"; Int16 cannot represent non integer value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  // Note: maps to same type as cds.Integer
  describe('cds.Int32', () => {
    const field = 'myInt32'
    const number = 2147483647

    test('cds.Int32 is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, number, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })

    test('cds.Int32 is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, number)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })
  })

  // Note: maps to same type as cds.Integer64
  xdescribe('cds.Int64', () => {
    const field = 'myInt64'

    test('cds.Int64 is correctly parsed from input literal int value', async () => {
      const value = '999999999999999' // Max Int64 = 9223372036854775807, but lower due to SQLite rounding errors
      const body = _getMutationForFieldWithLiteralValue(field, value, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })

    test('cds.Int64 is correctly parsed from variable string value', async () => {
      const value = '999999999999999' // Max Int64 = 9223372036854775807, but lower due to SQLite rounding errors
      const body = _getMutationAndVariablesForFieldWithVariable(field, value)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })
  })

  describe('cds.Integer', () => {
    const field = 'myInteger'
    const number = 2147483647

    test('cds.Integer is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, number, false)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })

    test('cds.Integer is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, number)
      const data = { TypesService: { MyEntity: { create: [{ [field]: number }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(number)
    })
  })

  xdescribe('cds.Integer64', () => {
    const field = 'myInteger64'

    describe('input literal', () => {
      test('cds.Integer64 is correctly parsed from input literal int value', async () => {
        const value = '999999999999999' // Max Integer64 = 9223372036854775807, but lower due to SQLite rounding errors
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Integer64 throws error when input literal int value exceeds max value', async () => {
        const value = '9223372036854775808' // Max Integer64 + 1
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Int64 must be an integer value between -(2^63) and 2^63 - 1: 9223372036854775808'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when input literal int value exceeds min value', async () => {
        const value = '-9223372036854775809' // Min Integer64 - 1
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Int64 must be an integer value between -(2^63) and 2^63 - 1: -9223372036854775809'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 is correctly parsed from input literal numeric string value', async () => {
        const value = '999999999999999' // Max Integer64 = 9223372036854775807, but lower due to SQLite rounding errors
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Integer64 throws error when input literal string value exceeds max value', async () => {
        const value = '9223372036854775808' // Max Integer64 + 1
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int64 must be an integer value between -(2^63) and 2^63 - 1: "9223372036854775808"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when input literal string value exceeds min value', async () => {
        const value = '-9223372036854775809' // Min Integer64 - 1
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int64 must be an integer value between -(2^63) and 2^63 - 1: "-9223372036854775809"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when input literal is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int64 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when input literal is not a number, but a whitespace string', async () => {
        const value = ' '
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Int64 cannot represent non integer value: " "'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when input literal is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Int64 cannot represent non integer value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Integer64 throws error when variable value is a number, due to potential rounding errors', async () => {
        const value = 123
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 123 at "input.myInteger64"; Int64 variable value must be represented by a string: 123'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 is correctly parsed from variable string value', async () => {
        const value = '999999999999999' // Max Integer64 = 9223372036854775807, but lower due to SQLite rounding errors
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Integer64 throws error when variable string value exceeds max value', async () => {
        const value = '9223372036854775808' // Max Integer64 + 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "9223372036854775808" at "input.myInteger64"; Int64 must be an integer value between -(2^63) and 2^63 - 1: 9223372036854775808'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when variable string value exceeds min value', async () => {
        const value = '-9223372036854775809' // Min Integer64 - 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "-9223372036854775809" at "input.myInteger64"; Int64 must be an integer value between -(2^63) and 2^63 - 1: -9223372036854775809'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when variable value is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myInteger64"; Int64 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when variable value is not a number, but a whitespace string', async () => {
        const value = ' '
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value " " at "input.myInteger64"; Int64 cannot represent non integer value: " "'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Integer64 throws error when variable value is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value false at "input.myInteger64"; Int64 variable value must be represented by a string: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  // Note: maps to same type as cds.Binary
  // REVISIT: express-graphql limits request body size to 100kb by default:
  // - https://github.com/graphql/express-graphql/issues/346
  // - https://github.com/graphql/express-graphql/blob/28e4c2924ea6984bf918465cefdadae340d8780e/src/parseBody.ts#L96
  describe.skip('cds.LargeBinary', () => {
    const field = 'myLargeBinary'
    const buffer = _getTestBuffer(500000) // 500 KB

    describe('input literal', () => {
      test('cds.LargeBinary is correctly parsed from large input literal base64 encoded string value', async () => {
        const value = buffer.toString('base64')
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: _toBase64Url(value) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.LargeBinary is correctly parsed from large input literal base64url encoded string value', async () => {
        const value = _toBase64Url(buffer.toString('base64'))
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })
    })

    describe('variable value', () => {
      test('cds.LargeBinary is correctly parsed from large variable base64 encoded string value', async () => {
        const value = buffer.toString('base64')
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: _toBase64Url(value) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })

      test('cds.LargeBinary is correctly parsed from large variable base64url encoded string value', async () => {
        const value = _toBase64Url(buffer.toString('base64'))
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(buffer)
      })
    })
  })

  // Note: maps to same type as cds.String
  // REVISIT: express-graphql limits request body size to 100kb by default:
  // - https://github.com/graphql/express-graphql/issues/346
  // - https://github.com/graphql/express-graphql/blob/28e4c2924ea6984bf918465cefdadae340d8780e/src/parseBody.ts#L96
  describe.skip('cds.LargeString', () => {
    const field = 'myLargeString'
    const value = 'This is a test string! '.repeat(100000)

    test('cds.LargeString is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, value, true)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })

    test('cds.LargeString is correctly parsed from variable value', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, value, true)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })
  })

  describe('cds.String', () => {
    const field = 'myString'
    const value = 'This is a test string'

    test('cds.String is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, value, true)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })

    test('cds.String is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, value)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })
  })

  describe('cds.Time', () => {
    const field = 'myTime'

    describe('input literal', () => {
      test('cds.Time is correctly parsed from input literal string value', async () => {
        const value = '07:59:59'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Time throws error when input literal is a string containing an invalid time format value', async () => {
        const value = '99:99:99'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Time values must be strings in the ISO 8601 format hh:mm:ss: "99:99:99"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Time throws error when input literal is a string containing a non-time value', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'Time values must be strings in the ISO 8601 format hh:mm:ss: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Time throws error when input literal is not a string, but an integer', async () => {
        const value = 123456
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Time cannot represent non string value: 123456'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Time is correctly parsed from variable string value', async () => {
        const value = '07:59:59'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.Time throws error when variable is a string containing an invalid time format value', async () => {
        const value = '99:99:99'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "99:99:99" at "input.myTime"; Time values must be strings in the ISO 8601 format hh:mm:ss: "99:99:99"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Time throws error when variable is a string containing a non-time value', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myTime"; Time values must be strings in the ISO 8601 format hh:mm:ss: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Time throws error when variable value is not a string, but an integer', async () => {
        const value = 123456
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 123456 at "input.myTime"; Time cannot represent non string value: 123456'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.Timestamp', () => {
    const field = 'myTimestamp'

    describe('input literal', () => {
      test('cds.Timestamp is correctly parsed from input literal timestamp string value', async () => {
        const value = '2021-06-27T14:52:23.123Z'
        const returnValue = /2021-06-27T14:52:23\.123(0000)?Z/ // timestamp precision increase with cds^7
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: expect.stringMatching(returnValue) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toMatch(returnValue)
      })

      test('cds.Timestamp is correctly parsed from input literal high precision timestamp string value', async () => {
        const value = '2021-06-27T14:52:23.1234567Z'
        const returnValue = /2021-06-27T14:52:23\.123(4567)?Z/ // timestamp precision increase with cds^7
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const data = { TypesService: { MyEntity: { create: [{ [field]: expect.stringMatching(returnValue) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toMatch(returnValue)
      })

      test('cds.Timestamp throws error when input literal is a string containing a non-time value', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message =
          'Timestamp values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ss.sTZD with up to 7 digits of fractional seconds: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Timestamp throws error when input literal is not a string, but an integer', async () => {
        const value = 123456
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'Timestamp cannot represent non string value: 123456'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.Timestamp is correctly parsed from variable timestamp string value', async () => {
        const value = '2021-06-27T14:52:23.123Z'
        const returnValue = /2021-06-27T14:52:23\.123(0000)?Z/ // timestamp precision increase with cds^7
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: expect.stringMatching(returnValue) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toMatch(returnValue)
      })

      test('cds.Timestamp is correctly parsed from variable high precision timestamp string value', async () => {
        const value = '2021-06-27T14:52:23.1234567Z'
        const returnValue = /2021-06-27T14:52:23\.123(4567)?Z/ // timestamp precision increase with cds^7
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: expect.stringMatching(returnValue) }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toMatch(returnValue)
      })

      test('cds.Timestamp throws error when variable is a string containing a non-timestamp value', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myTimestamp"; Timestamp values must be strings in the ISO 8601 format YYYY-MM-DDThh-mm-ss.sTZD with up to 7 digits of fractional seconds: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.Timestamp throws error when variable value is not a string, but an integer', async () => {
        const value = 123456
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 123456 at "input.myTimestamp"; Timestamp cannot represent non string value: 123456'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.UInt8', () => {
    const field = 'myUInt8'

    describe('input literal', () => {
      test('cds.UInt8 is correctly parsed from input literal int value', async () => {
        const value = 255 // Max UInt8
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.UInt8 throws error when input literal int value exceeds max value', async () => {
        const value = 256 // Max UInt8 + 1
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'UInt8 must be an integer value between 0 and 2^8 - 1: 256'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when input literal int value exceeds min value', async () => {
        const value = -1 // Min UInt8 - 1
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'UInt8 must be an integer value between 0 and 2^8 - 1: -1'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when input literal is not a number, but a numeric string', async () => {
        const value = '123'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'UInt8 cannot represent non integer value: "123"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when input literal is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationForFieldWithLiteralValue(field, value, true)
        const message = 'UInt8 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when input literal is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationForFieldWithLiteralValue(field, value, false)
        const message = 'UInt8 cannot represent non integer value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })

    describe('variable value', () => {
      test('cds.UInt8 is correctly parsed from variable number value', async () => {
        const value = 255 // Max UInt8
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
        const response = await POST('/graphql', body)
        expect(response.data).toEqual({ data })

        const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
        expect(result[field]).toEqual(value)
      })

      test('cds.UInt8 throws error when variable number value exceeds max value', async () => {
        const value = 256 // Max UInt8 + 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value 256 at "input.myUInt8"; UInt8 must be an integer value between 0 and 2^8 - 1: 256'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when variable number value exceeds min value', async () => {
        const value = -1 // Min UInt8 - 1
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value -1 at "input.myUInt8"; UInt8 must be an integer value between 0 and 2^8 - 1: -1'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when variable value is not a number, but a numeric string', async () => {
        const value = '123'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "123" at "input.myUInt8"; UInt8 cannot represent non integer value: "123"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when variable value is not a number, but a non-numeric string', async () => {
        const value = 'bla'
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value "bla" at "input.myUInt8"; UInt8 cannot represent non integer value: "bla"'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })

      test('cds.UInt8 throws error when variable value is not a number, but a boolean', async () => {
        const value = false
        const body = _getMutationAndVariablesForFieldWithVariable(field, value)
        const message =
          'Variable "$input" got invalid value false at "input.myUInt8"; UInt8 cannot represent non integer value: false'
        const response = await POST('/graphql', body)
        expect(response.data.errors[0].message).toEqual(message)
      })
    })
  })

  describe('cds.UUID', () => {
    const field = 'myUUID'
    const value = 'a94f80eb-0a8e-4a12-b02f-0c1747200bf0'

    test('cds.UUID is correctly parsed from input literal', async () => {
      const body = _getMutationForFieldWithLiteralValue(field, value, true)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })

    test('cds.UUID is correctly parsed from variable value', async () => {
      const body = _getMutationAndVariablesForFieldWithVariable(field, value)
      const data = { TypesService: { MyEntity: { create: [{ [field]: value }] } } }
      const response = await POST('/graphql', body)
      expect(response.data).toEqual({ data })

      const result = await SELECT.one.from('sap.cds.graphql.types.MyEntity').columns(field)
      expect(result[field]).toEqual(value)
    })
  })
})
