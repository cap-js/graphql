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
            message: 'Value is required',
            target: 'notEmptyI'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
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
            message: 'Multiple errors occurred. Please see the details for more information.',
            details: [
              {
                message: 'Value is required',
                target: 'notEmptyI'
              },
              {
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
            message: 'Value 10 is not in specified range [0, 3]',
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
            message: 'Es sind mehrere Fehler aufgetreten.',
            details: [
              {
                message: 'Wert ist erforderlich',
                target: 'inRange'
              },
              {
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
            message: 'Internal Server Error'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$myProperty') // No custom properties in production for 500 errors
      expect(response.data.errors[0].extensions).not.toHaveProperty('my') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$my') // No custom properties in production for 500 errors
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
            message: 'Internal Server Error'
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
            message: 'Internal Server Error'
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
            message: 'Internal Server Error'
          }
        }
      ]
      const response = await POST('/graphql', { query }, { headers: { 'Accept-Language': 'de' } })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('myProperty') // No custom properties without $ prefix in production
      expect(response.data.errors[0].extensions).not.toHaveProperty('$myProperty') // No custom properties in production for 500 errors
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
            message: 'Some Custom Error Message',
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
            message: 'Multiple errors occurred. Please see the details for more information.',
            details: [
              {
                message: 'Some Custom Error Message 1',
                target: 'some_field'
              },
              {
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
            message: 'Oh no! Error on READ G',
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
            message: 'The order of 20 books exceeds the stock by 10'
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
            message: 'Internal Server Error'
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
            message: 'Internal Server Error'
          }
        }
      ]
      const response = await POST('/graphql', { query })
      expect(response.data).toMatchObject({ errors })
      expect(response.data.errors[0].extensions).not.toHaveProperty('stacktrace') // No stacktrace in production
    })
  })
})
