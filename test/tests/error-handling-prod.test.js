describe('graphql - error handling in production', () => {
  process.env.NODE_ENV = 'production'
  const cds = require('@sap/cds/lib')
  const path = require('path')
  const { gql } = require('../util')

  const { axios, POST } = cds.test(path.join(__dirname, '../resources/error-handling'))
  // Prevent axios from throwing errors for non 2xx status codes
  axios.defaults.validateStatus = false

  beforeEach(() => {
    jest.spyOn(console, 'warn')
    jest.spyOn(console, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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
            code: '400',
            target: 'notEmptyI'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(console.warn.mock.calls[0][1]).toMatchObject({
        code: '400',
        element: 'notEmptyI',
        entity: 'ValidationErrorsService.A',
        message: 'Value is required',
        numericSeverity: 4,
        target: 'notEmptyI',
        type: 'cds.Integer',
        value: undefined,
        stack: expect.any(String)
      })
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
            code: '400',
            details: [
              {
                code: '400',
                message: 'Value is required',
                target: 'notEmptyI'
              },
              {
                code: '400',
                message: 'Value is required',
                target: 'notEmptyS'
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0]).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(response.data.errors[0].extensions.details[1]).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            code: '400',
            target: 'inRange'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            code: '400',
            details: [
              {
                code: '400',
                message: 'Wert ist erforderlich',
                target: 'inRange'
              },
              {
                code: '400',
                message: 'Value "foo" is invalid according to enum declaration {"high", "medium", "low"}',
                target: 'oneOfEnumValues'
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0]).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(response.data.errors[0].extensions.details[1]).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(console.warn.mock.calls[0][1]).toMatchObject({
        code: '400',
        message: 'Multiple errors occurred. Please see the details for more information.',
        details: [
          {
            args: ['inRange'],
            code: '400',
            element: 'inRange',
            entity: 'ValidationErrorsService.C',
            message: 'Value is required',
            numericSeverity: 4,
            target: 'inRange',
            type: 'cds.Integer',
            value: undefined,
            stack: expect.any(String)
          },
          {
            args: ['"foo"', '"high", "medium", "low"'],
            code: '400',
            element: 'oneOfEnumValues',
            entity: 'ValidationErrorsService.C',
            enum: ['@assert.range', 'type', 'enum'],
            message: 'Value "foo" is invalid according to enum declaration {"high", "medium", "low"}',
            numericSeverity: 4,
            target: 'oneOfEnumValues',
            type: 'cds.String',
            value: 'foo',
            stack: expect.any(String)
          }
        ]
      })
      expect(console.warn.mock.calls[0][1]).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$myProperty') // No custom properties in production for 5xx errors
      expect(response.data.errors[0].extensions).not.toHaveProperty('my') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$my') // No custom properties in production for 5xx errors
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$myProperty') // No custom properties in production for 5xx errors
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            target: 'some_field'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            code: '500',
            details: [
              {
                code: 'Some-Custom-Code1',
                message: 'Some Custom Error Message 1',
                target: 'some_field'
              },
              {
                code: 'Some-Custom-Code2',
                message: 'Some Custom Error Message 2',
                target: 'some_field'
              }
            ]
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions.details[0]).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(response.data.errors[0].extensions.details[1]).not.toHaveProperty('stacktrace') // No stacktrace in production
      expect(console.error.mock.calls[0][1]).toMatchObject({
        code: '500',
        message: 'Multiple errors occurred. Please see the details for more information.',
        details: [
          {
            code: 'Some-Custom-Code1',
            message: 'Some Custom Error Message 1',
            numericSeverity: 4,
            status: 418,
            target: 'some_field',
            stack: expect.any(String)
          },
          {
            code: 'Some-Custom-Code2',
            message: 'Some Custom Error Message 2',
            numericSeverity: 4,
            status: 500,
            target: 'some_field',
            stack: expect.any(String)
          }
        ]
      })
      expect(console.error.mock.calls[0][1]).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
    })

    test('Thrown error is modified in srv.on(error) handler', async () => {
      const query = gql`
        {
          CustomHandlerErrorsService {
            G {
              nodes {
                id
              }
            }
          }
        }
      `
      const errors = [
        {
          message: 'Oh no! Error on READ G',
          extensions: {
            code: '418',
            $myProperty: 'My value G2'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('modify') // Property deleted in srv.on(error) handler
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            code: '400'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })
  })
})
