import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import HeadlessField from '../../../src/components/headless/HeadlessField'
import { TentativeValuesDataSource } from '@encolajs/validator'
import { useFormState, useValidation } from '../../../src'
import { formStateKey } from '../../../src/constants/symbols'

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
            [formStateKey]: formState,
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
            [formStateKey]: formState,
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
        value: expect.any(String),
        error: null,
        isDirty: expect.any(Boolean),
        isTouched: expect.any(Boolean),
        isValidating: expect.any(Boolean),
        isVisited: expect.any(Boolean),
        isFocused: expect.any(Boolean),
        validate: expect.any(Function),
        reset: expect.any(Function),
        attrs: expect.any(Object),
        events: expect.any(Object),
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value.value,
              onInput: events.input,
              onBlur: events.blur,
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value.value,
              onInput: events.input,
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value.value,
              onChange: events.change, // use the default implementation
              onFocus: events.focus,
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value.value,
              onInput: events.input,
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
            [formStateKey]: formState,
          },
        },
      })

      await wrapper.unmount()
      expect(unregisterSpy).toHaveBeenCalledWith('name')
    })
  })

  describe('Edge cases and error handling', () => {
    it('supports deep nested fields', async () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'profile.age',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              type: 'number',
              onInput: events.input,
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs }) =>
            h('input', {
              value: attrs.value,
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value.value,
              onInput: events.input,
              onBlur: events.blur,
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
