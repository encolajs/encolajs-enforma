import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useDynamicProps } from '../../src/'
import { formConfigKey, formContextKey, formControllerKey } from '../../src/'

// Mock the Vue inject function
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    inject: vi.fn((key) => {
      if (key === formControllerKey) {
        return {
          values: vi.fn().mockReturnValue({ name: 'John', age: 30 }),
          errors: vi.fn().mockReturnValue({ name: ['Name is required'] }),
        }
      }
      if (key === formContextKey) {
        return {
          theme: 'dark',
          locale: 'en',
        }
      }
      if (key === formConfigKey) {
        return {
          expressions: {
            allowComplex: true,
          },
        }
      }
      return undefined
    }),
  }
})

describe('useDynamicProps', () => {
  test('should evaluate boolean conditions', () => {
    const { evaluateCondition: evaluateConditionFn } = useDynamicProps()

    // Test with true boolean
    const trueCondition = evaluateConditionFn(true)
    expect(trueCondition.value).toBe(true)

    // Test with false boolean
    const falseCondition = evaluateConditionFn(false)
    expect(falseCondition.value).toBe(false)
  })

  test('should evaluate undefined conditions as true', () => {
    const { evaluateCondition: evaluateConditionFn } = useDynamicProps()

    const undefinedCondition = evaluateConditionFn(undefined)
    expect(undefinedCondition.value).toBe(true)
  })

  test('should evaluate string conditions with expressions', () => {
    const { evaluateCondition } = useDynamicProps()

    // Test with a simple expression
    const simpleCondition = evaluateCondition('form.values().name === "John"')
    expect(simpleCondition.value).toBe(true)

    // Test with a more complex expression
    const complexCondition = evaluateCondition('form.values().age > 25')
    expect(complexCondition.value).toBe(true)

    // Test with a false expression
    const falseCondition = evaluateCondition('form.values().age < 20')
    expect(falseCondition.value).toBe(false)
  })

  test('should handle errors in expression evaluation', () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const { evaluateCondition } = useDynamicProps()

    // Test with an expression that throws an error
    const errorCondition = evaluateCondition('{$forms.invalid.property}')
    expect(errorCondition.value).toBe(false)

    // Verify that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Enforma] Expression error: Failed to create evaluator function: Unexpected token '.'",
      expect.any(Object)
    )

    // Restore the spy
    consoleErrorSpy.mockRestore()
  })

  test('should evaluate props with expressions returning computed refs', () => {
    const { evaluateProps } = useDynamicProps()

    // Test with props containing expressions
    const props = {
      label: '${form.values().name}',
      placeholder: '${form.values().age}',
      type: 'text',
    }

    const evaluatedProps = evaluateProps(props)

    // Verify that expressions are evaluated as computed refs
    expect(evaluatedProps.label.value).toBe('John')
    expect(evaluatedProps.placeholder.value).toBe(30)

    // Non-expression values remain as is
    expect(evaluatedProps.type).toBe('text')
  })

  test('should provide context for expression evaluation', () => {
    const { getContext } = useDynamicProps({ localValue: 'local' })

    // Get the context
    const context = getContext()

    // Verify that the context contains the expected properties
    // Form should be the form controller now
    expect(typeof context.form.values).toBe('function')
    expect(typeof context.form.errors).toBe('function')
    expect(context.form.values()).toEqual({ name: 'John', age: 30 })
    expect(context.form.errors()).toEqual({ name: ['Name is required'] })

    // Context and config
    expect(context.context).toEqual({ theme: 'dark', locale: 'en' })
    expect(context.config).toEqual({ expressions: { allowComplex: true } })

    // Local context still works
    expect(context.localValue).toBe('local')
  })
})
