import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useField } from '../../src/composables/useField'
import { FieldReturn } from '../../src'
import { ComputedRef } from 'vue'

// Mock the form state (normally returned from useFormState)
const mockFormState = {
  // Mock field registration functionality
  registerField: vi.fn().mockImplementation((name) => ({
    value: initialData[name],
    error: null,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    isVisited: false,
  })),
  unregisterField: vi.fn(),
  getField: vi.fn(),

  // Mock update functions
  setFieldValue: vi.fn(),
  touchField: vi.fn(),

  // Mock validation
  validateField: vi.fn().mockResolvedValue(true),

  // Mock data access
  getFieldValue: vi.fn((name) => initialData[name]),

  // Mock form state
  formState: {
    fields: new Map(),
    isSubmitting: false,
    isValidating: false,
  },
}

// Initial test data
const initialData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
}

const mocks = vi.hoisted(() => {
  return {
    onMounted: vi.fn((fn) => fn()),
    onBeforeUnmount: vi.fn(),
    computed: vi.fn((getter) => ({
      value: getter(),
    })),
    watch: vi.fn(),
    ref: vi.fn((val) => ({ value: val })),
  }
})

// Mock the vue module
vi.mock('vue', () => {
  return {
    onMounted: mocks.onMounted,
    onBeforeUnmount: mocks.onBeforeUnmount,
    computed: mocks.computed,
    watch: mocks.watch,
    ref: mocks.ref,
  }
})

describe('useField', () => {
  let field: ComputedRef<FieldReturn | null>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Reset Vue mock implementations
    mocks.onMounted.mockImplementation((fn) => fn())
    mocks.onBeforeUnmount.mockImplementation(() => {})
    mocks.computed.mockImplementation((getter) => ({
      value: getter(),
    }))

    // Create field instance
    // @ts-expect-error Incomplete mocking
    field = useField('name', mockFormState, {
      validateOnMount: false,
    })
  })

  afterEach(() => {
    field = null
  })

  describe('initialization', () => {
    it('should register field with form state', () => {
      expect(mockFormState.registerField).toHaveBeenCalledWith('name')
    })

    it('should throw error if field name is missing', () => {
      // @ts-expect-error Incomplete mocking
      expect(() => useField('', mockFormState)).toThrow(
        'Field name is required'
      )
    })

    it('should throw error if form state is missing', () => {
      expect(() => useField('name', null)).toThrow('Form state is required')
    })

    it('should validate on mount if option is set', () => {
      // Reset mocks
      vi.clearAllMocks()
      mocks.onMounted.mockImplementationOnce((fn) => fn())

      // Create field with validateOnMount: true
      // @ts-expect-error Incomplete mocking
      field = useField('name', mockFormState, {
        validateOnMount: true,
      })

      // Check validate was called
      expect(mockFormState.validateField).toHaveBeenCalledWith('name')
    })

    it('should set up cleanup on unmount', () => {
      // Check onBeforeUnmount was called
      expect(mocks.onBeforeUnmount).toHaveBeenCalled()
    })
  })

  describe('field value and state', () => {
    it('should provide access to field value', () => {
      expect(field.value.value).toBe(initialData.name)
    })

    it('should provide access to field error state', () => {
      expect(field.value.error).toBeNull()
    })

    it('should provide access to field dirty state', () => {
      expect(field.value.isDirty).toBe(false)
    })

    it('should provide access to field touched state', () => {
      expect(field.value.isTouched).toBe(false)
    })

    it('should provide access to field validating state', () => {
      expect(field.value.isValidating).toBe(false)
    })
  })

  describe('event handlers', () => {
    it('should handle change events', () => {
      const newValue = 'Jane Doe'

      // Call handleChange
      field.value.events.input({ value: newValue })

      // Check form state was updated
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(
        'name',
        newValue,
        'input'
      )
    })

    it('should handle change events with custom trigger', () => {
      const newValue = 'Jane Doe'

      // Call handleChange with custom trigger
      field.value.events.change({ value: newValue })

      // Check form state was updated with correct trigger
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(
        'name',
        newValue,
        'change'
      )
    })

    it('should handle blur events', () => {
      // Call handleBlur
      field.value.events.blur()

      // Check form state was updated
      expect(mockFormState.touchField).toHaveBeenCalledWith('name')
    })
  })

  describe('validation', () => {
    it('should validate field', async () => {
      // Set up mock validation result
      mockFormState.validateField.mockResolvedValueOnce(true)

      // Call validate
      const result = await field.value.validate()

      // Check validation was called
      expect(mockFormState.validateField).toHaveBeenCalledWith('name')

      // Check result
      expect(result).toBe(true)
    })

    it('should handle validation failure', async () => {
      // Set up mock validation result
      mockFormState.validateField.mockResolvedValueOnce(false)

      // Call validate
      const result = await field.value.validate()

      // Check validation was called
      expect(mockFormState.validateField).toHaveBeenCalledWith('name')

      // Check result
      expect(result).toBe(false)
    })
  })

  describe('field reset', () => {
    it('should reset field to initial state', () => {
      // Clear previous calls to the mock
      mockFormState.getFieldValue.mockClear()
      mockFormState.setFieldValue.mockClear()

      // Set up mock original value
      mockFormState.getFieldValue.mockReturnValueOnce('John Doe')

      // Call reset
      field.value.reset()

      // Check original value was retrieved
      expect(mockFormState.getFieldValue).toHaveBeenCalledWith('name')

      // Check form state was updated
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(
        'name',
        'John Doe',
        'input'
      )
    })
  })

  describe('HTML binding helpers', () => {
    it('should provide HTML binding attributes', () => {
      // Access attrs
      const attrs = field.value.attrs

      // Check structure
      expect(attrs).toEqual(
        expect.objectContaining({
          value: expect.any(String),
          'aria-invalid': false,
        })
      )
    })

    it('should handle aria attributes for errors', () => {
      // Mock an error state
      const fieldWithError = {
        id: 'email',
        value: 'test',
        error: 'This field is invalid',
        isDirty: true,
        isTouched: true,
        isValidating: false,
        isVisited: true,
      }

      // Mock registerField to return our error state
      mockFormState.registerField.mockReturnValueOnce(fieldWithError)

      // Create new field instance with error
      // @ts-expect-error Incomplete mocking
      const errorField = useField('email', mockFormState)

      // Access attrs
      const attrs = errorField.value.attrs

      // Check aria attributes
      expect(attrs['aria-invalid']).toBe(true)
      expect(attrs['aria-errormessage']).toBe('error-email')
    })

    it('should handle input event from HTML element', () => {
      // Create mock event
      const mockEvent = {
        target: {
          value: 'Jane Doe',
        },
      }

      // Get the onInput handler
      const inputHandler = field.value.events.input

      // Call with mock event
      inputHandler(mockEvent)

      // Check that setFieldValue was called with the correct value
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(
        'name',
        'Jane Doe',
        'input'
      )
    })
  })
})
