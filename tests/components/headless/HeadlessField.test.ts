import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import HeadlessField from '../../../src/components/headless/HeadlessField'
import { TentativeValuesDataSource } from '@encolajs/validator'
import { useFormState, useValidation } from '../../../src'

describe('HeadlessField', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Mock validator factory for validation rules
  vi.mock('@encolajs/validator', () => ({
    ValidatorFactory: vi.fn().mockImplementation(() => ({
      make: () => ({
        validate: vi.fn().mockResolvedValue(true),
        validatePath: vi.fn().mockResolvedValue(true),
      }),
    })),
    TentativeValuesDataSource: vi.fn().mockImplementation((data) => ({
      clone: () => ({ ...data }),
      getRawData: () => ({ ...data }),
      getValue: (path) => data[path],
      setValue: vi.fn(),
      commit: vi.fn(),
      commitAll: vi.fn(),
      hasTentativeValue: () => false,
    })),
  }))

  // Create initial form data
  const initialData = {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30,
    },
  }

  // Create form state
  const createFormState = (data = initialData) => {
    const validation = useValidation()
    return useFormState(
      // @ts-expect-error TentativeValuesDataSource is mocked
      new TentativeValuesDataSource(data, {}),
      {
        name: 'required|min_length:2',
        email: 'required|email',
        'profile.age': 'required|integer|min:18',
      },
      {
        validatorFactory: validation.factory,
      }
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('mounts with required props and form context', () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('errors when mounted without form context', () => {
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
      })

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('must be used within an EncolaForm component')
      )
    })

    it('passes field state to default slot', () => {
      const formState = createFormState()
      let slotProps

      mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: (props) => {
            slotProps = props
            return '<div>Field Content</div>'
          },
        },
      })

      expect(slotProps).toMatchObject({
        value: expect.any(Object),
        error: expect.any(Object),
        isDirty: expect.any(Object),
        isTouched: expect.any(Object),
        isValidating: expect.any(Object),
        isVisited: expect.any(Object),
        isFocused: expect.any(Object),
        handleChange: expect.any(Function),
        handleBlur: expect.any(Function),
        handleFocus: expect.any(Function),
        validate: expect.any(Function),
        reset: expect.any(Function),
        attrs: expect.any(Object),
        name: expect.any(String),
      })
    })
  })

  describe('Field validation lifecycle', () => {
    it('validates on blur when validateOn is blur', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'blur',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleChange, handleBlur }) =>
            h('input', {
              value: attrs.value.value,
              onInput: (e) => handleChange(e.target.value, 'input'),
              onBlur: handleBlur,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new@email.com')
      await input.trigger('blur')
      await flushPromises()

      const formField = formState.getField('email')
      expect(formField.isTouched).toBe(true)
      expect(formField.isDirty).toBe(true)
    })

    it('validates on input when validateOn is input', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'input',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleChange }) =>
            h('input', {
              value: attrs.value.value,
              onInput: (e) =>
                handleChange((e.target as HTMLInputElement).value, 'input'),
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new@email.com')

      const formField = formState.getField('email')
      expect(formField.isDirty).toBe(true)
      expect(formField.isTouched).toBe(false)
    })

    it('validates on input when validateOn is change', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'change',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleFocus }) =>
            h('input', {
              value: attrs.value.value,
              onChange: attrs.value.onChange, // use the default implementation
              onFocus: handleFocus,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.trigger('focus')
      await input.setValue('new@email.com')

      const formField = formState.getField('email')
      expect(formField.isDirty).toBe(true)
      expect(formField.isTouched).toBe(true)
      expect(formField.isFocused).toBe(true)
    })
  })

  describe('Form integration', () => {
    it('updates form state when field value changes', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleChange }) =>
            h('input', {
              value: attrs.value.value,
              onInput: (e) =>
                handleChange((e.target as HTMLInputElement).value, 'input'),
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('Jane')

      const field = formState.getField('name')
      expect(field.value).toBe('Jane')
    })

    it('cleans up on unmount', async () => {
      const formState = createFormState()
      const unregisterSpy = vi.spyOn(formState, 'unregisterField')

      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
      })

      await wrapper.unmount()
      expect(unregisterSpy).toHaveBeenCalledWith('name')
    })
  })

  describe('Edge cases and error handling', () => {
    it('handles deep nested fields', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'profile.age',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleChange }) =>
            h('input', {
              value: attrs.value.value,
              type: 'number',
              onInput: (e) =>
                handleChange((e.target as HTMLInputElement).value, 'input'),
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue(25)

      const field = formState.getField('profile.age')
      expect(parseInt(field.value)).toBe(25)
    })

    it('handles undefined field values', async () => {
      // @ts-expect-error Test case for undefined field value
      const formState = createFormState({})
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'nonexistent',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs }) =>
            h('input', {
              value: attrs.value.value,
            }),
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('maintains field state during re-renders', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
        },
        global: {
          provide: {
            encolaForm: formState,
          },
        },
        slots: {
          default: ({ attrs, handleChange, handleBlur }) =>
            h('input', {
              value: attrs.value.value,
              onInput: (e) => handleChange(e.target.value, 'input'),
              onBlur: handleBlur,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new@email.com')
      await input.trigger('blur')
      flushPromises()

      const field = formState.getField('email')
      expect(field.value).toBe('new@email.com')

      // Force re-render
      await wrapper.setProps({ name: 'email', validateOn: 'blur' })

      expect(field.isTouched).toBe(true)
      expect(field.value).toBe('new@email.com')
    })
  })
})
