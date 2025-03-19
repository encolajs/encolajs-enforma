import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormState } from '../../src/composables/useFormState'
import {
  ValidatorFactory,
  TentativeValuesDataSource,
  PlainObjectDataSource,
} from '@encolajs/validator'
import { flushPromises } from '@vue/test-utils'

// Create mock objects that we can access globally in the test file
const mockValidator = {
  validate: vi.fn().mockResolvedValue(true),
  validatePath: vi.fn().mockResolvedValue(true),
  validateGroup: vi.fn().mockResolvedValue(true),
  getErrors: vi.fn().mockReturnValue({}),
  getErrorsForPath: vi.fn().mockReturnValue([]),
  setServerErrors: vi.fn(),
  clearServerErrors: vi.fn(),
  clearErrorsForPath: vi.fn(),
  reset: vi.fn(),
  getDependentFields: vi.fn().mockReturnValue([]),
}

let formData = {} // We'll populate this in beforeEach

// Mock dataSource for consistent behavior
const mockDataSource = {
  getValue: vi.fn((path) => formData[path]),
  setValue: vi.fn((path, value) => {
    formData[path] = value
  }),
  getRawData: vi.fn(() => formData),
  hasTentativeValue: vi.fn().mockReturnValue(false),
  commit: vi.fn(),
  commitAll: vi.fn(),
  clone: vi.fn(() => ({ ...formData })),
}

// Mock the validator factory to return our mock validator
const mockValidatorFactory = {
  make: vi.fn().mockReturnValue(mockValidator),
}

// Mocks for the module
vi.mock('@encolajs/validator', async () => {
  const { PlainObjectDataSource } = await vi.importActual('@encolajs/validator')
  return {
    ValidatorFactory: vi.fn().mockImplementation(() => mockValidatorFactory),
    TentativeValuesDataSource: vi.fn().mockImplementation(() => mockDataSource),
    PlainObjectDataSource,
  }
})

describe('useFormState', () => {
  // Define test data
  const initialData = {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30,
    },
  }

  const rules = {
    name: 'required',
    email: 'required|email',
    'profile.age': 'required|integer|min:18',
  }

  // Create a mock data source
  let dataSource: any
  let formState: ReturnType<typeof useFormState>

  beforeEach(() => {
    // Reset our data for each test
    formData = initialData

    // Reset all mock functions
    vi.clearAllMocks()

    // Create data source
    // @ts-expect-error - We're mocking the constructor
    dataSource = new TentativeValuesDataSource({}, {})

    // Create formState with our mocked dependencies
    formState = useFormState(dataSource, rules, {
      validateOn: 'blur',
    })
  })

  describe('initialization', () => {
    it('should initialize with correct initial state', () => {
      expect(formState.fields.size).toBe(0)
      expect(formState.isSubmitting.value).toBe(false)
      expect(formState.isValidating.value).toBe(false)
      expect(formState.isValid.value).toBe(true)
      expect(formState.isDirty.value).toBe(false)
      expect(formState.isTouched.value).toBe(false)
    })

    it('should create validator with provided rules', () => {
      // We should check that the factory's make method was called with our rules
      expect(ValidatorFactory).toHaveBeenCalled()
      const mockFactoryInstance = (
        ValidatorFactory as unknown as ReturnType<typeof vi.fn>
      ).mock.results[0].value
      expect(mockFactoryInstance.make).toHaveBeenCalledWith(rules, {})
    })

    it('should throw error if dataSource is not provided', () => {
      expect(() => useFormState(undefined as any)).toThrow(
        'useFormState requires a dataSource'
      )
    })
  })

  describe('field management', () => {
    it('should register field and return field state', () => {
      const fieldName = 'name'

      // Register field
      const fieldState = formState.registerField(fieldName)

      // Check field state structure
      expect(fieldState).toEqual(
        expect.objectContaining({
          error: null,
          isDirty: false,
          isTouched: false,
          isValidating: false,
          isVisited: false,
        })
      )

      // Check the value matches what our mock returns
      expect(fieldState.value).toBe(initialData.name)

      // Check that field was added to the fields map
      expect(formState.getField(fieldName)).not.toBeNull()

      // Verify getValue was called with the right path
      expect(mockDataSource.getValue).toHaveBeenCalledWith(fieldName)
    })

    it('should unregister field correctly', () => {
      const fieldName = 'name'

      // Register field first
      formState.registerField(fieldName)
      expect(formState.getField(fieldName)).not.toBeUndefined()

      // Unregister field
      formState.unregisterField(fieldName)
      expect(formState.getField(fieldName)).toBeUndefined()
    })

    it('should set field value and mark as dirty', () => {
      const fieldName = 'name'
      const newValue = 'Joana'

      // Register field first
      const fieldState = formState.registerField(fieldName)
      expect(fieldState.isDirty).toBe(false)

      // Set field value
      formState.setFieldValue(fieldName, newValue, 'input')

      // Check field state was updated
      expect(fieldState.value).toBe(newValue)
      expect(fieldState.isDirty).toBe(true)

      // Check datasource was updated
      expect(mockDataSource.setValue).toHaveBeenCalledWith(fieldName, newValue)
    })

    it('should mark field as touched on touchField', () => {
      const fieldName = 'name'

      // Register field first
      const fieldState = formState.registerField(fieldName)
      expect(fieldState.isTouched).toBe(false)
      expect(fieldState.isVisited).toBe(false)

      // Touch field
      formState.touchField(fieldName)

      // Check field state was updated
      expect(fieldState.isTouched).toBe(true)
      expect(fieldState.isVisited).toBe(true)
    })

    it('should unregister nested fields in correct order', () => {
      // Setup a complex nested structure
      const formData = {
        address: {
          city: 'New York',
          details: {
            street: '123 Main St',
            zip: '10001',
          },
        },
      }

      const formState = useFormState(new PlainObjectDataSource(formData), {})

      // Register fields in parent -> child order
      formState.registerField('address')
      formState.registerField('address.city')
      formState.registerField('address.details')
      formState.registerField('address.details.street')
      formState.registerField('address.details.zip')

      // Store initial field IDs for verification
      const initialFieldIds = new Set(formState.fields.keys())

      // Unregister the root field
      formState.unregisterField('address')

      // Verify all fields are removed
      for (const fieldId of initialFieldIds) {
        expect(formState.fields.has(fieldId)).toBe(false)
      }

      // Verify all paths are removed
      expect(formState.pathToId.size).toBe(0)
      expect(formState.fields.size).toBe(0)

      // Verify specific paths are gone
      expect(formState.pathToId.has('address')).toBe(false)
      expect(formState.pathToId.has('address.city')).toBe(false)
      expect(formState.pathToId.has('address.details')).toBe(false)
      expect(formState.pathToId.has('address.details.street')).toBe(false)
      expect(formState.pathToId.has('address.details.zip')).toBe(false)
    })

    it('should unregister array fields correctly', () => {
      const formData = new PlainObjectDataSource({
        addresses: [
          {
            city: 'New York',
            zip: '10001',
          },
          {
            city: 'Boston',
            zip: '02101',
          },
        ],
      })

      const formState = useFormState(new PlainObjectDataSource(formData), {})

      // Register array fields with dot notation
      formState.registerField('addresses')
      formState.registerField('addresses.0')
      formState.registerField('addresses.0.city')
      formState.registerField('addresses.0.zip')
      formState.registerField('addresses.1')
      formState.registerField('addresses.1.city')
      formState.registerField('addresses.1.zip')

      // Unregister first array item
      formState.unregisterField('addresses.0')

      // Verify only first item fields are removed
      expect(formState.pathToId.has('addresses')).toBe(true)
      expect(formState.pathToId.has('addresses.0')).toBe(false)
      expect(formState.pathToId.has('addresses.0.city')).toBe(false)
      expect(formState.pathToId.has('addresses.0.zip')).toBe(false)
      expect(formState.pathToId.has('addresses.1')).toBe(true)
      expect(formState.pathToId.has('addresses.1.city')).toBe(true)
      expect(formState.pathToId.has('addresses.1.zip')).toBe(true)
    })
  })

  describe('validation', () => {
    it('should validate field on blur when validateOn is blur', async () => {
      const fieldName = 'email'
      mockValidator.validatePath.mockResolvedValueOnce(true)

      // Register field first
      formState.registerField(fieldName)

      // Touch field which should trigger validation since validateOn is 'blur'
      await formState.touchField(fieldName)

      // Check validator was called
      expect(mockValidator.validatePath).toHaveBeenCalledWith(
        fieldName,
        expect.any(Object)
      )
    })

    it('should handle field validation failure', async () => {
      const fieldName = 'email'
      const errorMessage = 'Invalid email format'

      // Mock validation failure
      mockValidator.validatePath.mockResolvedValueOnce(false)
      mockValidator.getErrorsForPath.mockReturnValueOnce([errorMessage])

      // Register field
      const fieldState = formState.registerField(fieldName)

      // Validate field
      const isValid = await formState.validateField(fieldName)

      // Check results
      expect(isValid).toBe(false)
      expect(fieldState.error).toBe(errorMessage)
      expect(formState.errors[fieldName]).toEqual([errorMessage])
    })

    it('should validate entire form', async () => {
      // Register some fields
      const nameField = formState.registerField('name')
      const emailField = formState.registerField('email')

      // Mock form validation success
      mockValidator.validate.mockResolvedValueOnce(true)

      // Validate form
      const isValid = await formState.validate()

      // Check results
      expect(isValid).toBe(true)
      expect(mockValidator.validate).toHaveBeenCalled()
      expect(mockDataSource.commitAll).toHaveBeenCalled()
    })

    it('should handle form validation failure', async () => {
      // Register some fields
      const nameField = formState.registerField('name')
      const emailField = formState.registerField('email')

      // Mock form validation failure
      mockValidator.validate.mockResolvedValueOnce(false)
      mockValidator.getErrors.mockReturnValueOnce({
        email: ['Invalid email format'],
      })

      // Validate form
      const isValid = await formState.validate()

      // Check results
      expect(isValid).toBe(false)
      expect(formState.errors.email).toEqual(['Invalid email format'])
      expect(emailField.error).toBe('Invalid email format')
    })
  })

  describe('form actions', () => {
    it('should reset form state', () => {
      // Register and modify some fields
      const nameField = formState.registerField('name')
      formState.setFieldValue('name', 'Jane')
      formState.touchField('name')

      const emailField = formState.registerField('email')
      formState.setFieldValue('email', 'jane@example.com')
      formState.touchField('email')

      // Add some errors
      mockValidator.validatePath.mockResolvedValueOnce(false)
      mockValidator.getErrorsForPath.mockReturnValueOnce(['Error'])
      formState.validateField('email')

      // Reset form
      formState.reset()

      // Check field states were reset
      expect(nameField.isDirty).toBe(false)
      expect(nameField.isTouched).toBe(false)
      expect(nameField.error).toBe(null)

      expect(emailField.isDirty).toBe(false)
      expect(emailField.isTouched).toBe(false)
      expect(emailField.error).toBe(null)

      // Check form state was reset
      expect(formState.isSubmitting.value).toBe(false)
      expect(formState.isValidating.value).toBe(false)
      expect(formState.validationCount.value).toBe(0)

      // Check errors were cleared
      expect(Object.keys(formState.errors).length).toBe(0)

      // Check validator was reset
      expect(mockValidator.reset).toHaveBeenCalled()
    })

    it('should handle form submission', async () => {
      // Create a mock submit handler
      const submitHandler = vi.fn().mockResolvedValue(undefined)

      // Create form state with submit handler
      const formWithSubmit = useFormState(dataSource, rules, {
        validateOn: 'blur',
        submitHandler,
      })

      // Mock successful validation
      mockValidator.validate.mockResolvedValueOnce(true)

      // Submit form
      const result = await formWithSubmit.submit()
      await flushPromises()

      // Check validation was performed
      expect(mockValidator.validate).toHaveBeenCalled()

      // Check submit handler was called with correct data
      expect(submitHandler).toHaveBeenCalledWith(formData)

      // Check result
      expect(result).toBe(true)
    })

    it('should not call submit handler if validation fails', async () => {
      // Create a mock submit handler
      const submitHandler = vi.fn().mockResolvedValue(undefined)

      // Create form state with submit handler
      const formWithSubmit = useFormState(dataSource, rules, {
        validateOn: 'blur',
        submitHandler,
      })

      // Mock failed validation
      mockValidator.validate.mockResolvedValueOnce(false)

      // Submit form
      const result = await formWithSubmit.submit()

      // Check validation was performed
      expect(mockValidator.validate).toHaveBeenCalled()

      // Check submit handler was not called
      expect(submitHandler).not.toHaveBeenCalled()

      // Check result
      expect(result).toBe(false)
    })
  })

  describe('form state updates', () => {
    it('should calculate isDirty', () => {
      // Initially not dirty
      expect(formState.isDirty.value).toBe(false)

      // Register field and make it dirty
      const nameField = formState.registerField('name')
      formState.setFieldValue('name', 'James')

      // Should now be dirty
      expect(nameField.isDirty).toBe(true)
      expect(formState.isDirty.value).toBe(true)
    })

    it('should calculate isTouched', () => {
      // Initially not touched
      expect(formState.isTouched.value).toBe(false)

      // Register field and touch it
      const nameField = formState.registerField('name')
      formState.touchField('name')

      // Should now be touched
      expect(nameField.isTouched).toBe(true)
      expect(formState.isTouched.value).toBe(true)
    })

    it('should calculate isValid correctly', () => {
      // Initially valid (no errors)
      expect(formState.isValid.value).toBe(true)

      // Register field and add error
      const nameField = formState.registerField('name')
      formState.errors['name'] = ['Required field']

      // Should now be invalid
      expect(formState.isValid.value).toBe(false)
    })
  })

  describe('data access methods', () => {
    it('should get field value from data source', () => {
      const fieldName = 'name'

      // Get field value
      const value = formState.getFieldValue(fieldName)

      // Check data source was queried
      expect(mockDataSource.getValue).toHaveBeenCalledWith(fieldName)
    })

    it('should get all form data', () => {
      // Get form data
      const data = formState.getData()

      // Check data source was queried
      expect(mockDataSource.getRawData).toHaveBeenCalled()
    })

    it('should set form data and reset form state', () => {
      // Register some fields
      const nameField = formState.registerField('name')
      formState.setFieldValue('name', 'Jane')
      formState.touchField('name')

      // Make field dirty and touched
      expect(nameField.isDirty).toBe(true)
      expect(nameField.isTouched).toBe(true)

      // Set new data
      const newData = {
        name: 'Alice',
        email: 'alice@example.com',
      }

      // Set data (this should internally call reset)
      formState.setData(newData)

      // Check data source was updated
      expect(mockDataSource.setValue).toHaveBeenCalledWith('name', 'Alice')
      expect(mockDataSource.setValue).toHaveBeenCalledWith(
        'email',
        'alice@example.com'
      )

      // Instead of checking if reset was called, check the observable effects of reset:
      // Field should no longer be dirty or touched
      expect(nameField.isDirty).toBe(false)
      expect(nameField.isTouched).toBe(false)
      expect(nameField.error).toBe(null)

      // Form state should be reset
      expect(formState.isSubmitting.value).toBe(false)
      expect(formState.isValidating.value).toBe(false)
    })
  })
})
