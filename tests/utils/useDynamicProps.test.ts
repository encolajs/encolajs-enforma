import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { ref } from 'vue'
import {
  formConfigKey,
  formContextKey,
  formStateKey,
} from '@/constants/symbols'
import { FormController } from '@/types'
import {
  evaluateCondition,
  evaluateObject,
} from '@/utils/exprEvaluator'

// Mock the Vue inject function
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    inject: vi.fn((key) => {
      if (key === formStateKey) {
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
    const simpleCondition = evaluateCondition('form.name === "John"')
    expect(simpleCondition.value).toBe(true)

    // Test with a more complex expression
    const complexCondition = evaluateCondition('form.age > 25')
    expect(complexCondition.value).toBe(true)

    // Test with a false expression
    const falseCondition = evaluateCondition('form.age < 20')
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
      'Error evaluating expression: {$forms.invalid.property}',
      expect.any(Error)
    )

    // Restore the spy
    consoleErrorSpy.mockRestore()
  })

  test('should evaluate props with expressions', () => {
    const { evaluateProps } = useDynamicProps()

    // Test with props containing expressions
    const props = {
      label: '${form.name}',
      placeholder: '${form.age}',
      type: 'text',
    }

    const evaluatedProps = evaluateProps(props)

    // Verify that the expressions were evaluated
    expect(evaluatedProps.label).toBe('John')
    expect(evaluatedProps.placeholder).toBe(30)
    expect(evaluatedProps.type).toBe('text')
  })

  test('should provide context for expression evaluation', () => {
    const { getContext } = useDynamicProps({ localValue: 'local' })

    // Get the context
    const context = getContext()

    // Verify that the context contains the expected properties
    expect(context.form).toEqual({ name: 'John', age: 30 })
    expect(context.context).toEqual({ theme: 'dark', locale: 'en' })
    expect(context.errors).toEqual({ name: ['Name is required'] })
    expect(context.localValue).toBe('local')
  })
})
