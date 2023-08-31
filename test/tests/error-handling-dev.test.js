describe('graphql - error handling in development', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/error-handling'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('Errors thrown by CDS', () => {
    test('Single @mandatory validation error', async () => {
      const query = gql`
        mutation {
          ValidationErrorsService {
            A {
              create(input: { id: 1 }) {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Value is required',
          extensions: {
            code: 'ASSERT_NOT_NULL',
            message: 'Value is required',
            target: 'notEmptyI',
            args: ['notEmptyI'],
            entity: 'ValidationErrorsService.A',
            element: 'notEmptyI',
            type: 'cds.Integer',
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Multiple @mandatory validation errors', async () => {
      const query = gql`
        mutation {
          ValidationErrorsService {
            B {
              create(input: { id: 1 }) {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Multiple errors occurred. Please see the details for more information.',
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message: 'Multiple errors occurred. Please see the details for more information.',
            details: [
              {
                code: 'ASSERT_NOT_NULL',
                message: 'Value is required',
                target: 'notEmptyI',
                args: ['notEmptyI'],
                entity: 'ValidationErrorsService.B',
                element: 'notEmptyI',
                type: 'cds.Integer',
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              },
              {
                code: 'ASSERT_NOT_NULL',
                message: 'Value is required',
                target: 'notEmptyS',
                args: ['notEmptyS'],
                entity: 'ValidationErrorsService.B',
                element: 'notEmptyS',
                type: 'cds.String',
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Single @assert.range validation error', async () => {
      const query = gql`
        mutation {
          ValidationErrorsService {
            C {
              create(input: { inRange: 10 }) {
                inRange
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Value 10 is not in specified range [0, 3]',
          extensions: {
            code: 'ASSERT_RANGE',
            message: 'Value 10 is not in specified range [0, 3]',
            target: 'inRange',
            args: [10, 0, 3],
            entity: 'ValidationErrorsService.C',
            element: 'inRange',
            type: 'cds.Integer',
            value: 10,
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Multiple different validation errors with i18n', async () => {
      const query = gql`
        mutation {
          ValidationErrorsService {
            C {
              create(input: { oneOfEnumValues: "foo" }) {
                oneOfEnumValues
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Es sind mehrere Fehler aufgetreten.',
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message: 'Es sind mehrere Fehler aufgetreten.',
            details: [
              {
                code: 'ASSERT_NOT_NULL',
                message: 'Wert ist erforderlich',
                target: 'inRange',
                args: ['inRange'],
                entity: 'ValidationErrorsService.C',
                element: 'inRange',
                type: 'cds.Integer',
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              },
              {
                code: 'ASSERT_ENUM',
                message: 'Value "foo" is invalid according to enum declaration {"high", "medium", "low"}',
                target: 'oneOfEnumValues',
                args: ['"foo"', '"high", "medium", "low"'],
                entity: 'ValidationErrorsService.C',
                element: 'oneOfEnumValues',
                type: 'cds.String',
                value: 'foo',
                enum: ['@assert.range', 'type', 'enum'],
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
    })
  })

  describe('Errors thrown in custom handlers', () => {
    test('Thrown new error object with custom property', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            A {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Error on READ A',
          extensions: {
            code: '500',
            message: 'Error on READ A',
            myProperty: 'My value A',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Thrown error string', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            B {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Error on READ B',
          extensions: {
            code: '500',
            message: 'Error on READ B',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Thrown new cds.error', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            C {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Error on READ C',
          extensions: {
            code: '500',
            message: 'Error on READ C',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('Thrown new cds.error with custom code and property with i18n', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            D {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Mein custom Fehlercode',
          extensions: {
            code: 'MY_CODE',
            message: 'Mein custom Fehlercode',
            myProperty: 'My value D',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('req.error call with custom code and message', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            E {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Some Custom Error Message',
          extensions: {
            code: 'Some-Custom-Code',
            message: 'Some Custom Error Message',
            target: 'some_field',
            status: 418,
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('multiple req.error calls with custom code and message', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            F {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Multiple errors occurred. Please see the details for more information.',
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message: 'Multiple errors occurred. Please see the details for more information.',
            details: [
              {
                code: 'Some-Custom-Code1',
                message: 'Some Custom Error Message 1',
                target: 'some_field',
                status: 418,
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              },
              {
                code: 'Some-Custom-Code2',
                message: 'Some Custom Error Message 2',
                target: 'some_field',
                status: 500,
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('req.reject with numeric code and custom message', async () => {
      const query = gql`
        mutation {
          CustomHandlerErrorsService {
            Orders {
              create(input: { id: 1, quantity: 20, stock: 10 }) {
                id
                quantity
                stock
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'The order of 20 books exceeds the stock by 10',
          extensions: {
            code: '400',
            message: 'The order of 20 books exceeds the stock by 10',
            args: [20, 10],
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('req.reject with custom code and message', async () => {
      const query = gql`
        mutation {
          CustomHandlerErrorsService {
            Orders {
              create(input: { id: 2, quantity: 20, stock: 10 }) {
                id
                quantity
                stock
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'The order of 20 books exceeds the stock by 10',
          extensions: {
            code: 'ORDER_EXCEEDS_STOCK',
            message: 'The order of 20 books exceeds the stock by 10',
            target: 'ORDER_EXCEEDS_STOCK',
            args: [20, 10],
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })

    test('req.reject with custom code', async () => {
      const query = gql`
        mutation {
          CustomHandlerErrorsService {
            Orders {
              create(input: { id: 3, quantity: 20, stock: 10 }) {
                id
                quantity
                stock
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'The order of NULL books exceeds the stock by NULL',
          extensions: {
            code: 'ORDER_EXCEEDS_STOCK',
            message: 'The order of NULL books exceeds the stock by NULL',
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace).not.toHaveLength(0) // Stacktrace exists and is not empty
    })
  })
})
