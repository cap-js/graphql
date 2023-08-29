describe('graphql - error handling in production', () => {
  process.env.NODE_ENV = 'production'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('Multiple @mandatory validation errors', async () => {
      const message = 'Multiple errors occurred. Please see the details for more information.'
      const code = 'ASSERT_NOT_NULL'
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
                message: 'Value is required'
              },
              {
                code,
                message: 'Value is required'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('Multiple different validation errors with i18n', async () => {
      const message = 'Es sind mehrere Fehler aufgetreten.'
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
                message: 'Wert ist erforderlich'
              },
              {
                code: 'ASSERT_ENUM',
                message: 'Value "foo" is invalid according to enum declaration {"high", "medium", "low"}'
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
    })
  })

  describe('Errors thrown in custom handlers', () => {
    test('Thrown new error object with custom property', async () => {
      const message = 'Internal Server Error'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('Thrown error string', async () => {
      const message = 'Internal Server Error'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('Thrown new cds.error', async () => {
      const message = 'Internal Server Error'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('Thrown new cds.error with custom code and property with i18n', async () => {
      const message = 'Internal Server Error'
      const code = '500'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
                message: 'Some Custom Error Message 1'
              },
              {
                code: 'Some-Custom-Code2',
                message: 'Some Custom Error Message 2'
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

    test('req.reject with numeric code and custom message', async () => {
      const message = 'The order of 20 books exceeds the stock by 10'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('req.reject with custom code and message', async () => {
      const message = 'Internal Server Error'
      const code = '500'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })

    test('req.reject with custom code', async () => {
      const message = 'Internal Server Error'
      const code = '500'
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
            message
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })
  })
})
