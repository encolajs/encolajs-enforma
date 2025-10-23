import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import { createYupValidator } from '@/validators/yup'

describe('YupValidator', () => {
  describe('FormValidator interface implementation', () => {
    it('should implement all required FormValidator methods', () => {
      const schema = yup.object({ name: yup.string().required() })
      const validator = createYupValidator(schema)

      expect(validator.validate).toBeDefined()
      expect(validator.validatePath).toBeDefined()
      expect(validator.getErrors).toBeDefined()
      expect(validator.getErrorsForPath).toBeDefined()
      expect(validator.getDependentFields).toBeDefined()
      expect(validator.clearErrorsForPath).toBeDefined()
      expect(validator.reset).toBeDefined()
    })
  })

  describe('Successful validation', () => {
    it('should return true for valid data', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().min(18).required(),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validate({
        email: 'test@example.com',
        age: 25,
      })

      expect(result).toBe(true)
      expect(validator.getErrors()).toEqual({})
    })

    it('should clear errors after successful validation', async () => {
      const schema = yup.object({ name: yup.string().min(2).required() })
      const validator = createYupValidator(schema)

      // First fail
      await validator.validate({ name: 'a' })
      expect(Object.keys(validator.getErrors()).length).toBeGreaterThan(0)

      // Then succeed
      await validator.validate({ name: 'John' })
      expect(validator.getErrors()).toEqual({})
    })
  })

  describe('Failed validation', () => {
    it('should return false for invalid data', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().min(18).required(),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validate({
        email: 'invalid-email',
        age: 15,
      })

      expect(result).toBe(false)
    })

    it('should collect errors for invalid fields', async () => {
      const schema = yup.object({
        email: yup.string().email('Invalid email format').required(),
        age: yup.number().min(18, 'Must be at least 18').required(),
      })
      const validator = createYupValidator(schema)

      await validator.validate({
        email: 'invalid',
        age: 15,
      })

      const errors = validator.getErrors()
      expect(errors.email).toBeDefined()
      expect(errors.age).toBeDefined()
      expect(errors.email[0]).toContain('Invalid email')
      expect(errors.age[0]).toContain('at least 18')
    })

    it('should handle required field errors', async () => {
      const schema = yup.object({
        name: yup.string().required('Name is required'),
      })
      const validator = createYupValidator(schema)

      await validator.validate({})

      const errors = validator.getErrorsForPath('name')
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('required')
    })
  })

  describe('Path-based validation', () => {
    it('should validate single field by path', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().min(2).required(),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validatePath('email', {
        email: 'test@example.com',
        name: 'Jo',
      })

      expect(result).toBe(true)
      expect(validator.getErrorsForPath('email')).toEqual([])
    })

    it('should detect field-level errors', async () => {
      const schema = yup.object({
        email: yup.string().email('Invalid email').required(),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validatePath('email', {
        email: 'invalid',
      })

      expect(result).toBe(false)
      expect(validator.getErrorsForPath('email')).toHaveLength(1)
      expect(validator.getErrorsForPath('email')[0]).toContain('Invalid email')
    })

    it('should clear errors for validated path on success', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
      })
      const validator = createYupValidator(schema)

      // First fail
      await validator.validatePath('email', { email: 'invalid' })
      expect(validator.getErrorsForPath('email')).toHaveLength(1)

      // Then succeed
      await validator.validatePath('email', { email: 'valid@example.com' })
      expect(validator.getErrorsForPath('email')).toEqual([])
    })
  })

  describe('Nested objects and arrays', () => {
    it('should validate nested objects', async () => {
      const schema = yup.object({
        user: yup.object({
          name: yup.string().min(2).required(),
          email: yup.string().email().required(),
        }),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validate({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      })

      expect(result).toBe(true)
    })

    it('should collect errors from nested objects', async () => {
      const schema = yup.object({
        user: yup.object({
          name: yup.string().min(2, 'Name too short').required(),
          email: yup.string().email('Invalid email').required(),
        }),
      })
      const validator = createYupValidator(schema)

      await validator.validate({
        user: {
          name: 'J',
          email: 'invalid',
        },
      })

      const errors = validator.getErrors()
      expect(errors['user.name']).toBeDefined()
      expect(errors['user.email']).toBeDefined()
    })

    it('should validate arrays', async () => {
      const schema = yup.object({
        tags: yup.array().of(yup.string().min(1).required()),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validate({
        tags: ['tag1', 'tag2'],
      })

      expect(result).toBe(true)
    })

    it('should validate nested path in object', async () => {
      const schema = yup.object({
        address: yup.object({
          street: yup.string().required(),
          city: yup.string().required(),
        }),
      })
      const validator = createYupValidator(schema)

      const result = await validator.validatePath('address.street', {
        address: { street: '123 Main St', city: '' },
      })

      expect(result).toBe(true)
    })
  })

  describe('Error management', () => {
    it('should clear errors for specific path', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().min(2).required(),
      })
      const validator = createYupValidator(schema)

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(validator.getErrorsForPath('email')).toHaveLength(1)

      validator.clearErrorsForPath('email')
      expect(validator.getErrorsForPath('email')).toEqual([])
      expect(validator.getErrorsForPath('name')).toHaveLength(1)
    })

    it('should reset all errors', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().min(2).required(),
      })
      const validator = createYupValidator(schema)

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(Object.keys(validator.getErrors()).length).toBeGreaterThan(0)

      validator.reset()
      expect(validator.getErrors()).toEqual({})
    })

    it('should return empty array for path with no errors', () => {
      const schema = yup.object({ name: yup.string().required() })
      const validator = createYupValidator(schema)

      expect(validator.getErrorsForPath('name')).toEqual([])
    })
  })

  describe('getDependentFields', () => {
    it('should return empty array (Yup does not track dependencies)', () => {
      const schema = yup.object({ name: yup.string().required() })
      const validator = createYupValidator(schema)

      expect(validator.getDependentFields('name')).toEqual([])
    })
  })
})
