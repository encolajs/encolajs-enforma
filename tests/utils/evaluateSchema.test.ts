import { describe, expect, test, vi } from 'vitest'
import { evaluateSchema } from '../../src/utils/evaluateSchema'
import { FormSchema } from '../../src'

describe('evaluateSchema', () => {
  const mockFormController = {
    values: vi.fn().mockReturnValue({ name: 'John', age: 30 }),
    errors: vi.fn().mockReturnValue({ name: ['Name is required'] }),
  }

  const mockContext = {
    theme: 'dark',
    locale: 'en',
  }

  const mockConfig = {
    expressions: {
      allowComplex: true,
      delimiters: { start: '${', end: '}' },
    },
  }

  test('should evaluate conditions in schema items', () => {
    const schema = {
      firstName: { type: 'text', if: true },
      lastName: { type: 'text', if: false },
      age: { type: 'number', if: '${form.values().age > 25}' },
      country: { type: 'text', if: '${form.values().age < 20}' },
    }

    const result = evaluateSchema(
      schema,
      mockFormController,
      mockContext,
      mockConfig
    )

    // Verify that items without expressions return current value
    expect(result.firstName.if).toBe(true)
    expect(result.lastName.if).toBe(false)

    // Verify expression are evaluated
    expect(result.age.if).toBe(true)
    expect(result.country.if).toBe(false)
  })

  test('should evaluate expressions in schema attributes', () => {
    const schema = {
      fullName: {
        type: 'text',
        label: '${form.values().name}',
        description: 'Static text',
        validation: {
          required: true,
          minLength: '${form.values().age / 10}',
        },
      },
    }

    const result = evaluateSchema(
      schema,
      mockFormController,
      mockContext,
      mockConfig
    )

    // Check that string expressions are evaluated
    expect(result.fullName.label).toBe('John')

    // Check that static text remains unchanged
    expect(result.fullName.description).toBe('Static text')

    // Check that nested object expressions are evaluated
    expect(result.fullName.validation.minLength).toBe(3)
  })

  test('should handle empty or invalid schema', () => {
    // Test with empty object
    const emptyResult = evaluateSchema(
      {},
      mockFormController,
      mockContext,
      mockConfig
    )
    expect(emptyResult).toEqual({})

    // Test with non-array input
    const invalidResult = evaluateSchema(
      [] as unknown as FormSchema,
      mockFormController,
      mockContext,
      mockConfig
    )
    expect(invalidResult).toEqual([])
  })

  test('should not fail with missing form controller', () => {
    const schema = {
      test: {
        type: 'text',
        name: 'test',
        label: '${context.theme}',
      },
    }

    const result = evaluateSchema(schema, undefined, mockContext, mockConfig)

    // Should still work with context even if form controller is missing
    expect(result.test.label).toBe('dark')
  })
})
