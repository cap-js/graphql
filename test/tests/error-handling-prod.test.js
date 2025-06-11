describe('graphql - error handling in production', () => {
  process.env.NODE_ENV = 'production'
  const cds = require('@sap/cds')
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
          message: expect.any(String),
          extensions: {
            code: 'ASSERT_NOT_NULL',
            target: 'notEmptyI'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
      const log = console.warn.mock.calls[0][1] || JSON.parse(console.warn.mock.calls[0][0])
      expect(log).toMatchObject({ code: 'ASSERT_NOT_NULL', target: 'notEmptyI' })
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
          message: expect.any(String),
          extensions: {
            code: 'MULTIPLE_ERRORS',
            details: [
              {
                code: 'ASSERT_NOT_NULL',
                message: expect.any(String),
                target: 'notEmptyI'
              },
              {
                code: 'ASSERT_NOT_NULL',
                message: expect.any(String),
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
          message: expect.any(String),
          extensions: {
            code: 'ASSERT_RANGE',
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
            code: 'MULTIPLE_ERRORS',
            details: [
              {
                code: 'ASSERT_NOT_NULL',
                message: 'Wert ist erforderlich',
                target: 'inRange'
              },
              {
                code: 'ASSERT_ENUM',
                message: expect.any(String),
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
      const log = console.warn.mock.calls[0][1] || JSON.parse(console.warn.mock.calls[0][0])

      expect(log).toMatchObject({
        code: 'MULTIPLE_ERRORS',
        details: [
          { code: 'ASSERT_NOT_NULL', target: 'inRange' },
          {
            code: 'ASSERT_ENUM',
            target: 'oneOfEnumValues'
          }
        ]
      })

      expect(log).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
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
          message: 'Internal Server Error',
          extensions: {
            code: '500'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
      expect(response.data.errors[0].extensions).not.toHaveProperty('details') // No details since one of the errors is 5xx
      const log = console.error.mock.calls[0][1] || JSON.parse(console.error.mock.calls[0][0])
      expect(log).toMatchObject({
        code: 'MULTIPLE_ERRORS',
        details: [
          {
            code: 'Some-Custom-Code1',
            message: 'Some Custom Error Message 1',
            status: 418,
            target: 'some_field'
          },
          {
            code: 'Some-Custom-Code2',
            message: 'Some Custom Error Message 2',
            status: 500,
            target: 'some_field'
          }
        ]
      })
      expect(log).not.toHaveProperty('stacktrace') // No stacktrace outside of error details
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
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'en' } })
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
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'en' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })
  })
})
