describe('graphql - error handling in development', () => {
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/error-handling'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  describe('Errors thrown by CDS', () => {
    test('Single @mandatory validation error', async () => {
      const message = 'Value is required'
      const code = 'ASSERT_NOT_NULL'
      const element = 'notEmptyI'
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
          message,
          extensions: {
            code,
            message,
            target: element,
            args: [element],
            entity: 'ValidationErrorsService.A',
            element,
            type: 'cds.Integer',
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('Multiple @mandatory validation errors', async () => {
      const message = 'Multiple errors occurred. Please see the details for more information.'
      const code = 'ASSERT_NOT_NULL'
      const element1 = 'notEmptyI'
      const element2 = 'notEmptyS'
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
          message,
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message,
            details: [
              {
                code,
                message: 'Value is required',
                target: element1,
                args: [element1],
                entity: 'ValidationErrorsService.B',
                element: element1,
                type: 'cds.Integer',
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              },
              {
                code,
                message: 'Value is required',
                target: element2,
                args: [element2],
                entity: 'ValidationErrorsService.B',
                element: element2,
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
      expect(response.data.errors[0].extensions.stacktrace).toBe(undefined) // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).toEqual(`Error: ${code}`)
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('Single @assert.range validation error', async () => {
      const message = 'Value 10 is not in specified range [0, 3]'
      const code = 'ASSERT_RANGE'
      const element = 'inRange'
      const query = gql`
        mutation {
          ValidationErrorsService {
            C {
              create(input: { ${element}: 10 }) {
                ${element}
              }
            }
          }
        }
      `
      const errors = [
        {
          message,
          extensions: {
            code,
            message,
            target: element,
            args: [10, 0, 3],
            entity: 'ValidationErrorsService.C',
            element,
            type: 'cds.Integer',
            value: 10,
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('Multiple different validation errors with i18n', async () => {
      const message = 'Es sind mehrere Fehler aufgetreten.'
      const element1 = 'inRange'
      const element2 = 'oneOfEnumValues'
      const query = gql`
        mutation {
          ValidationErrorsService {
            C {
              create(input: { ${element2}: "foo" }) {
                ${element2}
              }
            }
          }
        }
      `
      const errors = [
        {
          message,
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message,
            details: [
              {
                code: 'ASSERT_NOT_NULL',
                message: 'Wert ist erforderlich',
                target: element1,
                args: ['inRange'],
                entity: 'ValidationErrorsService.C',
                element: element1,
                type: 'cds.Integer',
                numericSeverity: 4,
                stacktrace: expect.any(Array)
              },
              {
                code: 'ASSERT_ENUM',
                message: 'Value "foo" is invalid according to enum declaration {"high", "medium", "low"}',
                target: element2,
                args: ['"foo"', '"high", "medium", "low"'],
                entity: 'ValidationErrorsService.C',
                element: element2,
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
      expect(response.data.errors[0].extensions.stacktrace).toBe(undefined) // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).toEqual('Error: ASSERT_NOT_NULL')
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).toEqual('Error: ASSERT_ENUM')
    })
  })

  describe('Errors thrown in custom handlers', () => {
    test('Thrown new error object with custom property', async () => {
      const message = 'Error on READ A'
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
          message,
          extensions: {
            code: '500',
            message,
            myProperty: 'My value A',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${message}`)
    })

    test('Thrown error string', async () => {
      const message = 'Error on READ B'
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
          message,
          extensions: {
            code: '500',
            message,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${message}`)
    })

    test('Thrown new cds.error', async () => {
      const message = 'Error on READ C'
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
          message,
          extensions: {
            code: '500',
            message,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${message}`)
    })

    test('Thrown new cds.error with custom code and property with i18n', async () => {
      const message = 'Mein custom Fehlercode'
      const code = 'MY_CODE'
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
          message,
          extensions: {
            code,
            message,
            myProperty: 'My value D',
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('req.error call with custom code and message', async () => {
      const message = 'Some Custom Error Message'
      const code = 'Some-Custom-Code'
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
          message,
          extensions: {
            code,
            message,
            target: 'some_field',
            status: 418,
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${message}`)
    })

    test('multiple req.error calls with custom code and message', async () => {
      const message = 'Multiple errors occurred. Please see the details for more information.'
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
          message,
          extensions: {
            code: 'MULTIPLE_ERRORS',
            message,
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
      expect(response.data.errors[0].extensions.stacktrace).toBe(undefined) // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0].stacktrace[0]).toEqual('Error: Some Custom Error Message 1')
      expect(response.data.errors[0].extensions.details[1].stacktrace[0]).toEqual('Error: Some Custom Error Message 2')
    })

    test('req.reject with numeric code and custom message', async () => {
      const message = 'The order of 20 books exceeds the stock by 10'
      const code = 'ORDER_EXCEEDS_STOCK'
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
          message,
          extensions: {
            code: 400,
            message,
            args: [20, 10],
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('req.reject with custom code and message', async () => {
      const message = 'The order of 20 books exceeds the stock by 10'
      const code = 'ORDER_EXCEEDS_STOCK'
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
          message,
          extensions: {
            code,
            message,
            target: code,
            args: [20, 10],
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })

    test('req.reject with custom code', async () => {
      const message = 'The order of NULL books exceeds the stock by NULL'
      const code = 'ORDER_EXCEEDS_STOCK'
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
          message,
          extensions: {
            code,
            message,
            numericSeverity: 4,
            stacktrace: expect.any(Array)
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions.stacktrace[0]).toEqual(`Error: ${code}`)
    })
  })
})
