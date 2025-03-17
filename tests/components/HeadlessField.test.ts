import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import HeadlessField from '../../src/components/HeadlessField'

// Mock the useField composable
vi.mock('../../src/composables/useField', () => ({
  useField: vi.fn().mockImplementation((name, formState, options) => ({
    value: { value: 'test value' },
    error: { value: null },
    isDirty: { value: false },
    isTouched: { value: false },
    isValidating: { value: false },
    isVisited: { value: false },
    isFocused: { value: false },
    handleChange: (value: any, trigger: string) => {
      formState.setFieldValue(name, value, trigger)
    },
    handleBlur: () => {
      formState.touchField(name)
      if (options?.validateOn === 'blur') {
        formState.validateField(name)
      }
    },
    handleFocus: vi.fn(),
    validate: () => formState.validateField(name),
    reset: vi.fn(),
    attrs: {
      value: 'test value',
      onInput: vi.fn(),
      onChange: vi.fn(),
      onBlur: vi.fn(),
      'aria-invalid': false
    },
    name
  }))
}))

describe('HeadlessField', () => {
  // Mock console.error to catch warnings
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Mock form state for injection
  const mockFormState = {
    fields: new Map(),
    pathToId: new Map(),
    errors: {},
    isSubmitting: { value: false },
    isValidating: { value: false },
    validationCount: { value: 0 },
    submitted: { value: false },
    isDirty: { value: false },
    isTouched: { value: false },
    isValid: { value: true },
    registerField: vi.fn().mockReturnValue({
      id: 'test-id',
      path: 'test-field',
      value: 'test value',
      error: null,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      isVisited: false,
      isFocused: false
    }),
    unregisterField: vi.fn(),
    touchField: vi.fn(),
    getField: vi.fn().mockReturnValue({
      id: 'test-id',
      path: 'test-field',
      value: 'test value',
      error: null,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      isVisited: false,
      isFocused: false
    }),
    validate: vi.fn().mockResolvedValue(true),
    validateField: vi.fn().mockResolvedValue(true),
    reset: vi.fn(),
    submit: vi.fn().mockResolvedValue(true),
    setFieldValue: vi.fn(),
    getFieldValue: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn()
  }

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleError.mockClear()
  })

  describe('Component Mounting', () => {
    it('mounts successfully with required props and form context', () => {
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'test-field'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        },
        slots: {
          default: '<div>Field Content</div>'
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Field Content')
    })

    it('errors when mounted without form context', () => {
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'test-field'
        },
        slots: {
          default: '<div>Field Content</div>'
        }
      })

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('must be used within an EncolaForm component')
      )
      expect(wrapper.html()).toBe('')
    })
  })

  describe('Props Validation', () => {
    it('requires name prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(HeadlessField, {
        // @ts-expect-error test invalid prop
        props: {},
        global: {
          provide: {
            encolaForm: mockFormState
          }
        }
      })

      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })

    it('validates validateOn prop values', () => {
      const validValues = ['input', 'change', 'blur', 'submit', null]

      validValues.forEach(value => {
        const wrapper = mount(HeadlessField, {
          props: {
            name: 'test-field',
            validateOn: value
          },
          global: {
            provide: {
              encolaForm: mockFormState
            }
          }
        })

        expect(wrapper.props('validateOn')).toBe(value)
      })

      // Test invalid value
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(HeadlessField, {
        props: {
          name: 'test-field',
          validateOn: 'invalid'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        }
      })

      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })
  })

  describe('Slot Handling', () => {
    it('passes field state to default slot', () => {
      let slotProps

      mount(HeadlessField, {
        props: {
          name: 'test-field'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        },
        slots: {
          default: props => {
            slotProps = props
            return '<div>Field Content</div>'
          }
        }
      })

      expect(slotProps).toMatchObject({
        value: { value: expect.any(String) },
        error: { value: null },
        isDirty: { value: false },
        isTouched: { value: false },
        isValidating: { value: false },
        isVisited: {value: false},
        isFocused: { value: false },
        handleChange: expect.any(Function),
        handleBlur: expect.any(Function),
        handleFocus: expect.any(Function),
        validate: expect.any(Function),
        reset: expect.any(Function),
        attrs: expect.any(Object),
        name: expect.any(String)
      })
    })

    it('renders multiple field instances with unique states', () => {
      const wrapper = mount({
        template: `
          <div>
            <HeadlessField name="field1">
              <template #default="field1">
                <input v-bind="field1.attrs" data-testid="field1" />
              </template>
            </HeadlessField>
            <HeadlessField name="field2">
              <template #default="field2">
                <input v-bind="field2.attrs" data-testid="field2" />
              </template>
            </HeadlessField>
          </div>
        `,
        components: { HeadlessField }
      }, {
        global: {
          provide: {
            encolaForm: mockFormState
          }
        }
      })

      const field1 = wrapper.find('[data-testid="field1"]')
      const field2 = wrapper.find('[data-testid="field2"]')

      expect(field1.exists()).toBe(true)
      expect(field2.exists()).toBe(true)
      expect(field1.attributes()).not.toEqual(field2.attributes())
    })
  })

  describe('Form Integration', () => {
    it('registers field with form on mount', async () => {
      const { useField } = await import('../../src/composables/useField')

      mount(HeadlessField, {
        props: {
          name: 'test-field'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        }
      })

      await nextTick()
      expect(useField).toHaveBeenCalledWith(
        'test-field',
        mockFormState,
        expect.objectContaining({
          validateOn: null
        })
      )
    })
    it('unregisters field on unmount', async () => {
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'test-field'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        }
      })

      await wrapper.unmount()
      expect(mockFormState.unregisterField).toHaveBeenCalledWith('test-field')
    })
  })

  describe('Validation Behavior', () => {
    it('respects validateOn prop for validation timing', async () => {
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'test-field',
          validateOn: 'blur'
        },
        global: {
          provide: {
            encolaForm: mockFormState
          }
        },
        slots: {
          default: ({ handleChange, handleBlur }) => h('input', {
            onChange: (e) => handleChange(e.target.value, 'change'),
            onBlur: handleBlur
          })
        }
      })

      const input = wrapper.find('input')
      await input.setValue('new value')
      await input.trigger('change')
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith('test-field', 'new value', 'change')

      // Then trigger blur
      await input.trigger('blur')
      expect(mockFormState.touchField).toHaveBeenCalledWith('test-field')
      expect(mockFormState.validateField).toHaveBeenCalledWith('test-field')
    })
  })
})