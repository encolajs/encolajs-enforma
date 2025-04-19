import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import HeadlessField from '@/headless/HeadlessField'
import { formStateKey } from '@/constants/symbols'
import { useForm } from '@/headless/useForm'

describe('HeadlessField', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Create initial form data
  const initialData = {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30,
    },
  }

  // Create mock form proxy
  const createMockForm = (data: object = initialData) => {
    return useForm(data, {
      name: 'required|min_length:2',
      email: 'required|email',
      'profile.age': 'required|integer|gte:18',
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('mounts with required props and form context', () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            [formStateKey]: form,
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
      const form = createMockForm()
      let slotProps

      mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            [formStateKey]: form,
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
        validate: expect.any(Function),
        attrs: expect.any(Object),
        events: expect.any(Object),
        name: expect.any(String),
      })
    })
  })

  describe('field validation lifecycle', () => {
    it('validates on blur when validateOn is blur', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'blur',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              onInput: events.input,
              onBlur: events.blur,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new@email.com')
      await input.trigger('blur')
      await flushPromises()

      expect(form['email.$isTouched']).toBe(true)
      expect(form['email.$isDirty']).toBe(true)
    })

    it('validates on input when validateOn is input', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'input',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              onInput: events.input,
            }),
        },
      })

      expect(form['email.$isDirty']).toBe(false)

      const input = wrapper.find('input')
      await input.setValue('new@email.com')

      expect(form['email.$isDirty']).toBe(true)
    })

    it('validates on input when validateOn is change', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
          validateOn: 'change',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              onChange: events.change,
              onFocus: events.focus,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.trigger('focus')
      await input.setValue('new@email.com')

      expect(form['email.$isDirty']).toBe(true)
      expect(form['email.$isTouched']).toBe(true)
    })
  })

  describe('form integration', () => {
    it('updates form state when field value changes', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'name',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              onInput: events.input,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('Jane')

      expect(form.name).toBe('Jane')
    })

    it('cleans up on unmount', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'new_field',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
      })

      expect(form.hasField('new_field')).toBe(true)
      await wrapper.unmount()
      expect(form.hasField('new_field')).toBe(false)
    })
  })

  describe('edge cases and error handling', () => {
    it('supports deep nested fields', async () => {
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'profile.age',
        },
        global: {
          provide: {
            [formStateKey]: form,
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

      expect(form['profile.age']).toBe('25')
    })

    it('handles undefined field values', async () => {
      const form = createMockForm({})
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'nonexistent',
        },
        global: {
          provide: {
            [formStateKey]: form,
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
      const form = createMockForm()
      const wrapper = mount(HeadlessField, {
        props: {
          name: 'email',
        },
        global: {
          provide: {
            [formStateKey]: form,
          },
        },
        slots: {
          default: ({ attrs, events }) =>
            h('input', {
              value: attrs.value,
              onInput: events.input,
              onBlur: events.blur,
            }),
        },
      })

      const input = wrapper.find('input')
      await input.setValue('new@email.com')
      await input.trigger('blur')
      await flushPromises()

      expect(form.email).toBe('new@email.com')

      // Force re-render
      await wrapper.setProps({ name: 'email', validateOn: 'blur' })

      expect(form['email.$isTouched']).toBe(true)
      expect(form.email).toBe('new@email.com')
    })
  })
})
