import { describe, it, expect } from 'vitest'
import { createEncolaValidator } from '@/validators/encolaValidator'

describe('EncolaValidator', () => {
  describe('FormValidator interface implementation', () => {
    it('should implement all required FormValidator methods', () => {
      const validator = createEncolaValidator({ name: 'required' })

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
      const validator = createEncolaValidator({
        email: 'required|email',
        age: 'required|numeric|min:18',
      })

      const result = await validator.validate({
        email: 'test@example.com',
        age: 25,
      })

      expect(result).toBe(true)
      expect(validator.getErrors()).toEqual({})
    })

    it('should clear errors after successful validation', async () => {
      const validator = createEncolaValidator({ name: 'required|min_length:2' })

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
      const validator = createEncolaValidator({
        email: 'required|email',
        age: 'required|numeric|min:18',
      })

      const result = await validator.validate({
        email: 'invalid-email',
        age: 15,
      })

      expect(result).toBe(false)
    })

    it('should collect errors for invalid fields', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
        name: 'required|min_length:2',
      })

      await validator.validate({
        email: 'invalid',
        name: 'J',
      })

      const errors = validator.getErrors()
      expect(errors.email).toBeDefined()
      expect(errors.name).toBeDefined()
      expect(errors.email.length).toBeGreaterThan(0)
      expect(errors.name.length).toBeGreaterThan(0)
    })

    it('should handle required field errors', async () => {
      const validator = createEncolaValidator({
        name: 'required',
      })

      await validator.validate({})

      const errors = validator.getErrorsForPath('name')
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('Path-based validation', () => {
    it('should validate single field by path', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
        name: 'required|min_length:2',
      })

      const result = await validator.validatePath('email', {
        email: 'test@example.com',
        name: 'Jo',
      })

      expect(result).toBe(true)
      expect(validator.getErrorsForPath('email')).toEqual([])
    })

    it('should detect field-level errors', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
      })

      const result = await validator.validatePath('email', {
        email: 'invalid',
      })

      expect(result).toBe(false)
      expect(validator.getErrorsForPath('email')).toHaveLength(1)
    })

    it('should clear errors for validated path on success', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
      })

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
      const validator = createEncolaValidator({
        'user.name': 'required|min_length:2',
        'user.email': 'required|email',
      })

      const result = await validator.validate({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      })

      expect(result).toBe(true)
    })

    it('should collect errors from nested objects', async () => {
      const validator = createEncolaValidator({
        'user.name': 'required|min_length:2',
        'user.email': 'required|email',
      })

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

    it('should validate array items with repeatable rules', async () => {
      const validator = createEncolaValidator({
        'tags.*.value': 'required|min_length:1',
      })

      const result = await validator.validate({
        tags: [{ value: 'tag1' }, { value: 'tag2' }],
      })

      expect(result).toBe(true)
    })
  })

  describe('Error management', () => {
    it('should clear errors for specific path', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
        name: 'required|min_length:2',
      })

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(validator.getErrorsForPath('email')).toHaveLength(1)

      validator.clearErrorsForPath('email')
      expect(validator.getErrorsForPath('email')).toEqual([])
      expect(validator.getErrorsForPath('name')).toHaveLength(1)
    })

    it('should reset all errors', async () => {
      const validator = createEncolaValidator({
        email: 'required|email',
        name: 'required|min_length:2',
      })

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(Object.keys(validator.getErrors()).length).toBeGreaterThan(0)

      validator.reset()
      expect(validator.getErrors()).toEqual({})
    })

    it('should return empty array for path with no errors', () => {
      const validator = createEncolaValidator({ name: 'required' })

      expect(validator.getErrorsForPath('name')).toEqual([])
    })
  })

  describe('getDependentFields', () => {
    it('should return dependent fields array (may be empty depending on rules)', async () => {
      const validator = createEncolaValidator({
        password: 'required|min_length:8',
        password_confirmation: 'required',
      })

      const dependents = validator.getDependentFields('password')
      expect(Array.isArray(dependents)).toBe(true)
    })

    it('should return empty array for fields with no dependencies', () => {
      const validator = createEncolaValidator({
        name: 'required',
      })

      expect(validator.getDependentFields('name')).toEqual([])
    })
  })

  describe('Custom messages', () => {
    it('should accept custom messages parameter', async () => {
      const validator = createEncolaValidator(
        { email: 'required|email' },
        {
          'email.required': 'Email field cannot be empty',
          'email.email': 'Please provide a valid email address',
        }
      )

      await validator.validate({ email: '' })

      const errors = validator.getErrorsForPath('email')
      expect(errors.length).toBeGreaterThan(0)
      expect(typeof errors[0]).toBe('string')
    })
  })
})
