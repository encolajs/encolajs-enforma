import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useField } from '../../src/composables/useField'
import { FieldReturn } from '../../src'
import { ComputedRef } from 'vue'

// Mock the form proxy (normally returned from useForm)
const mockForm = {
  // Field values via proxy
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,

  // Mock field metadata
  'name.$isDirty': false,
  'name.$isTouched': false,
  'name.$isValidating': false,
  'name.$errors': [],

  'email.$isDirty': false,
  'email.$isTouched': false,
  'email.$isValidating': false,
  'email.$errors': [],

  'age.$isDirty': false,
  'age.$isTouched': false,
  'age.$isValidating': false,
  'age.$errors': [],

  // Mock field functions
  getField: vi.fn((path) => ({
    _id: path,
    $errors: mockForm[`${path}.$errors`] || [],
    $isDirty: mockForm[`${path}.$isDirty`] || false,
    $isTouched: mockForm[`${path}.$isTouched`] || false,
    $isValidating: mockForm[`${path}.$isValidating`] || false,
  })),

  validateField: vi.fn().mockResolvedValue(true),
  setFieldValue: vi.fn(),
  reset: vi.fn(),
  submit: vi.fn().mockResolvedValue(true),
  validate: vi.fn().mockResolvedValue(true),
  removeField: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  move: vi.fn(),
  sort: vi.fn(),
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
    field = useField('name', mockForm, {
      validateOnMount: false,
    })
  })

  afterEach(() => {
    field = null
  })

  describe('initialization', () => {
    it('should get field with form proxy', () => {
      expect(mockForm.getField).toHaveBeenCalledWith('name')
    })

    it('should throw error if field name is missing', () => {
      expect(() => useField('', mockForm)).toThrow('Field name is required')
    })

    it('should throw error if form is missing', () => {
      expect(() => useField('name', null)).toThrow('Form is required')
    })

    it('should validate on mount if option is set', () => {
      // Reset mocks
      vi.clearAllMocks()
      mocks.onMounted.mockImplementationOnce((fn) => fn())

      // Create field with validateOnMount: true
      field = useField('name', mockForm, {
        validateOnMount: true,
      })

      // Check validate was called
      expect(mockForm.validateField).toHaveBeenCalledWith('name')
    })
  })

  describe('field value and state', () => {
    it('should provide access to field value', () => {
      expect(field.value.value).toBe('John Doe')
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
    it('should handle input events', () => {
      const newValue = 'Jane Doe'

      // Call input event handler
      field.value.events.input({ value: newValue })

      // Check form value was updated
      expect(mockForm.name).toBe(newValue)
    })

    it('should handle change events', () => {
      const newValue = 'Jane Doe'

      // Call change event handler
      field.value.events.change({ value: newValue })

      // Check form value was updated and touched state was set
      expect(mockForm.name).toBe(newValue)
      expect(mockForm['name.$isTouched']).toBe(true)
    })

    it('should handle blur events', () => {
      // Call handleBlur
      field.value.events.blur()

      // Check touched state was set
      expect(mockForm['name.$isTouched']).toBe(true)
    })

    it('should handle focus events', () => {
      // Call focus handler
      field.value.events.focus()

      // Since we use ref for focus state, and our mock implementation doesn't track it,
      // we can't directly test the focus state change
      // This test is here to ensure the function exists and runs without errors
      expect(field.value.events.focus).toBeDefined()
    })
  })

  describe('validation', () => {
    it('should validate field', async () => {
      // Set up mock validation result
      mockForm.validateField.mockResolvedValueOnce(Promise.resolve(true))

      // Call validate
      const result = await field.value.validate()

      // Check validation was called
      expect(mockForm.validateField).toHaveBeenCalledWith('name')

      // Check result
      expect(result).toBe(true)
    })

    it('should handle validation failure', async () => {
      // Set up mock validation result
      mockForm.validateField.mockResolvedValueOnce(false)

      // Call validate
      const result = await field.value.validate()

      // Check validation was called
      expect(mockForm.validateField).toHaveBeenCalledWith('name')

      // Check result
      expect(result).toBe(false)
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
      // Setup field with error
      vi.spyOn(mockForm, 'getField').mockReturnValueOnce({
        _id: 'email',
        $errors: ['This field is invalid'],
        $isDirty: true,
        $isTouched: true,
        $isValidating: false,
      })

      // Also need to modify the error array on the form
      mockForm['email.$errors'] = ['This field is invalid']

      // Create new field instance with error
      const errorField = useField('email', mockForm)

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

      // Check that value was updated
      expect(mockForm.name).toBe('Jane Doe')
    })
  })
})
