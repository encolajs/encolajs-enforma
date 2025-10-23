import { describe, it, expect } from 'vitest'
import * as v from 'valibot'
import { createValibotValidator } from '@/validators/valibot'

describe('ValibotValidator', () => {
  describe('FormValidator interface implementation', () => {
    it('should implement all required FormValidator methods', () => {
      const schema = v.object({ name: v.string() })
      const validator = createValibotValidator(schema)

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
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        age: v.pipe(v.number(), v.minValue(18)),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validate({
        email: 'test@example.com',
        age: 25,
      })

      expect(result).toBe(true)
      expect(validator.getErrors()).toEqual({})
    })

    it('should clear errors after successful validation', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.minLength(2)),
      })
      const validator = createValibotValidator(schema)

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
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        age: v.pipe(v.number(), v.minValue(18)),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validate({
        email: 'invalid-email',
        age: 15,
      })

      expect(result).toBe(false)
    })

    it('should collect errors for invalid fields', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email format')),
        age: v.pipe(v.number(), v.minValue(18, 'Must be at least 18')),
      })
      const validator = createValibotValidator(schema)

      await validator.validate({
        email: 'invalid',
        age: 15,
      })

      const errors = validator.getErrors()
      expect(errors.email).toBeDefined()
      expect(errors.age).toBeDefined()
    })
  })

  describe('Path-based validation', () => {
    it('should validate single field by path', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        name: v.pipe(v.string(), v.minLength(2)),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validatePath('email', {
        email: 'test@example.com',
        name: 'Jo',
      })

      expect(result).toBe(true)
      expect(validator.getErrorsForPath('email')).toEqual([])
    })

    it('should detect field-level errors', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email')),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validatePath('email', {
        email: 'invalid',
      })

      expect(result).toBe(false)
      expect(validator.getErrorsForPath('email')).toHaveLength(1)
    })

    it('should handle non-existent paths gracefully', async () => {
      const schema = v.object({ name: v.string() })
      const validator = createValibotValidator(schema)

      const result = await validator.validatePath('nonexistent', {
        name: 'John',
      })

      expect(result).toBe(true)
    })
  })

  describe('Nested objects and arrays', () => {
    it('should validate nested objects', async () => {
      const schema = v.object({
        user: v.object({
          name: v.pipe(v.string(), v.minLength(2)),
          email: v.pipe(v.string(), v.email()),
        }),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validate({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      })

      expect(result).toBe(true)
    })

    it('should collect errors from nested objects', async () => {
      const schema = v.object({
        user: v.object({
          name: v.pipe(v.string(), v.minLength(2, 'Name too short')),
          email: v.pipe(v.string(), v.email('Invalid email')),
        }),
      })
      const validator = createValibotValidator(schema)

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
      const schema = v.object({
        tags: v.array(v.pipe(v.string(), v.minLength(1))),
      })
      const validator = createValibotValidator(schema)

      const result = await validator.validate({
        tags: ['tag1', 'tag2'],
      })

      expect(result).toBe(true)
    })
  })

  describe('Error management', () => {
    it('should clear errors for specific path', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        name: v.pipe(v.string(), v.minLength(2)),
      })
      const validator = createValibotValidator(schema)

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(validator.getErrorsForPath('email')).toHaveLength(1)

      validator.clearErrorsForPath('email')
      expect(validator.getErrorsForPath('email')).toEqual([])
      expect(validator.getErrorsForPath('name')).toHaveLength(1)
    })

    it('should reset all errors', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        name: v.pipe(v.string(), v.minLength(2)),
      })
      const validator = createValibotValidator(schema)

      await validator.validate({ email: 'invalid', name: 'J' })
      expect(Object.keys(validator.getErrors()).length).toBeGreaterThan(0)

      validator.reset()
      expect(validator.getErrors()).toEqual({})
    })

    it('should return empty array for path with no errors', () => {
      const schema = v.object({ name: v.string() })
      const validator = createValibotValidator(schema)

      expect(validator.getErrorsForPath('name')).toEqual([])
    })
  })

  describe('getDependentFields', () => {
    it('should return empty array (Valibot does not track dependencies)', () => {
      const schema = v.object({ name: v.string() })
      const validator = createValibotValidator(schema)

      expect(validator.getDependentFields('name')).toEqual([])
    })
  })
})
