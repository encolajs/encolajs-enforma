import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useValidation } from '../../src'

// Create mock functions
const mockRegister = vi.fn().mockReturnThis()
const mockMake = vi.fn().mockImplementation(() => ({
  validate: vi.fn().mockResolvedValue(true),
  validatePath: vi.fn().mockResolvedValue(true),
  getErrors: vi.fn().mockReturnValue({}),
  getErrorsForPath: vi.fn().mockReturnValue([]),
  getDependentFields: vi.fn().mockReturnValue([]),
  reset: vi.fn(),
}))

// Mock the ValidatorFactory
const mockFactoryInstance = {
  register: mockRegister,
  make: mockMake,
  _defaultMessageFormatter: null,
}

vi.mock('@encolajs/validator', () => {
  return {
    ValidatorFactory: vi.fn().mockImplementation(() => mockFactoryInstance),
    Validator: vi.fn(),
  }
})

describe('useValidation', () => {
  let validation: ReturnType<typeof useValidation>

  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks()
    // Create a fresh instance of useValidation
    validation = useValidation()
  })

  describe('registerRule', () => {
    it('should register a custom validation rule', () => {
      // Setup
      const ruleName = 'custom_rule'
      const ruleFunction = (value: any) => Boolean(value)
      const errorMessage = 'This field is invalid'

      // Execute
      const result = validation.registerRule(
        ruleName,
        ruleFunction,
        errorMessage
      )

      // Verify
      expect(result).toBeDefined()
      // We don't need to check if ValidatorFactory was called since
      // it's created inside the composable and we've mocked the instance
      expect(mockRegister).toHaveBeenCalledWith(
        ruleName,
        ruleFunction,
        errorMessage
      )
    })

    it('should return the validator factory instance', () => {
      // Setup
      const ruleName = 'test_rule'
      const ruleFunction = (value: any) => true
      const errorMessage = 'Test error'

      // Execute
      const result = validation.registerRule(
        ruleName,
        ruleFunction,
        errorMessage
      )

      // Verify
      expect(result).toBeTruthy()
      expect(result).toEqual(expect.any(Object))
    })
  })

  describe('setMessageFormatter', () => {
    it('should set a custom message formatter', () => {
      // Setup
      const formatter = (message: string, params: any[], fieldName: string) => {
        return `Custom: ${message}`
      }

      // Execute
      validation.setMessageFormatter(formatter)

      // Verify
      expect(mockFactoryInstance._defaultMessageFormatter).toBe(formatter)
    })
  })

  describe('makeValidator', () => {
    it('should create a validator with rules', () => {
      // Setup
      const rules = {
        name: 'required|min_length:2',
        email: 'required|email',
      }

      // Execute
      const validator = validation.makeValidator(rules)

      // Verify
      expect(mockMake).toHaveBeenCalledWith(rules, {})
      expect(validator).toBeDefined()
    })

    it('should create a validator with rules and custom messages', () => {
      // Setup
      const rules = {
        name: 'required|min_length:2',
        email: 'required|email',
      }
      const customMessages = {
        'name:required': 'Name is required',
        'email:email': 'Please enter a valid email',
      }

      // Execute
      const validator = validation.makeValidator(rules, customMessages)

      // Verify
      expect(mockMake).toHaveBeenCalledWith(rules, customMessages)
      expect(validator).toBeDefined()
    })
  })

  // Test for advanced scenarios
  describe('advanced usage', () => {
    it('should allow registering a class-based rule', () => {
      // Setup
      class CustomRule {
        validate(value: any) {
          return typeof value === 'string' && value.length > 5
        }
      }

      // Execute
      validation.registerRule(
        'custom_class_rule',
        // @ts-expect-error CustomRule does not extend the ValidationRule class
        CustomRule,
        'Value must be more than 5 characters'
      )

      // Verify
      expect(mockRegister).toHaveBeenCalledWith(
        'custom_class_rule',
        CustomRule,
        'Value must be more than 5 characters'
      )
    })

    it('should support async validation rules', async () => {
      // Setup
      const asyncRule = async (value: any) => {
        return Promise.resolve(Boolean(value))
      }

      // Execute
      validation.registerRule(
        'async_test',
        asyncRule,
        'Async validation failed'
      )

      // Create validator with the async rule
      const rules = { field: 'async_test' }
      const validator = validation.makeValidator(rules) // needed for by the mockMake function

      // Verify
      expect(mockRegister).toHaveBeenCalledWith(
        'async_test',
        asyncRule,
        'Async validation failed'
      )
      expect(mockMake).toHaveBeenCalledWith(rules, {})
    })
  })
})
