import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useField } from '@/headless/useField'
import { FieldControllerExport } from '../../src'
import { ComputedRef, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useForm } from '@/headless/useForm'
import { defineComponent, h } from 'vue'

describe('useField', () => {
  // Create a test component to properly test useField with actual form instance
  const TestFieldComponent = defineComponent({
    props: ['name', 'validateOnMount'],
    setup(props) {
      const initialData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      }

      const validationRules = {
        name: 'required|min_length:2',
        email: 'required|email',
        age: 'required|integer|gte:18',
      }

      const form = useForm(initialData, validationRules)
      const fieldCtrl = useField(props.name, form, {
        validateOnMount: props.validateOnMount || false,
      })

      // Call initField during setup to handle validateOnMount option
      fieldCtrl.value.initField()

      return {
        fieldCtrl,
        form,
      }
    },
    render() {
      return h('div', {}, [
        h('input', {
          value: this.fieldCtrl.value,
          onInput: this.fieldCtrl.events.input,
          onChange: this.fieldCtrl.events.change,
          onBlur: this.fieldCtrl.events.blur,
          onFocus: this.fieldCtrl.events.focus,
        }),
        h('span', { class: 'error' }, this.fieldCtrl.error),
      ])
    },
  })

  describe('initialization', () => {
    it('should throw error if field name is missing', () => {
      const form = useForm({})
      expect(() => useField('', form)).toThrow('Field name is required')
    })

    it('should throw error if form is missing', () => {
      // @ts-expect-error Testing invalid null input
      expect(() => useField('name', null)).toThrow('Form is required')
    })

    it('should handle field initialization correctly', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      // Check that the form and field are properly initialized
      expect(wrapper.vm.fieldCtrl.value).toBe('John Doe')
      expect(wrapper.vm.fieldCtrl.error).toBeNull()
      expect(wrapper.vm.fieldCtrl.isDirty).toBe(false)
      expect(wrapper.vm.fieldCtrl.isTouched).toBe(false)

      // Verify field exists in form
      expect(wrapper.vm.form.hasField('name')).toBe(true)
    })

    it('should validate on mount if option is set', async () => {
      const form = useForm(
        {
          name: 'John Doe',
        },
        {
          name: 'required',
        }
      )

      const validateFieldSpy = vi.spyOn(form, 'validateField')

      const field = useField('name', form, {
        validateOnMount: true,
      })

      field.value.initField()

      await flushPromises()
      expect(validateFieldSpy).toHaveBeenCalledWith('name')
    })
  })

  describe('field value and state', () => {
    it('should provide access to field value and state', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      expect(wrapper.vm.fieldCtrl.value).toBe('John Doe')
      expect(wrapper.vm.fieldCtrl.error).toBeNull()
      expect(wrapper.vm.fieldCtrl.isDirty).toBe(false)
      expect(wrapper.vm.fieldCtrl.isTouched).toBe(false)
      expect(wrapper.vm.fieldCtrl.isValidating).toBe(false)

      // Access to model property
      expect(wrapper.vm.fieldCtrl.model).toBeDefined()
    })
  })

  describe('event handlers', () => {
    it('should handle input events', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('Jane Doe')

      expect(wrapper.vm.fieldCtrl.value).toBe('Jane Doe')
      expect(wrapper.vm.form.name).toBe('Jane Doe')
    })

    it('should handle change events', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      // Directly call the change event handler
      wrapper.vm.fieldCtrl.events.change({ target: { value: 'Jane Doe' } })
      await flushPromises()

      expect(wrapper.vm.fieldCtrl.value).toBe('Jane Doe')
      expect(wrapper.vm.form.name).toBe('Jane Doe')
      expect(wrapper.vm.form['name.$isTouched'].value).toBe(true)
    })

    it('should handle blur events', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
          validateOn: 'blur',
        },
      })

      const input = wrapper.find('input')
      await input.trigger('blur')

      expect(wrapper.vm.form['name.$isTouched'].value).toBe(true)
    })

    it('should handle focus events', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      const input = wrapper.find('input')
      await input.trigger('focus')

      expect(wrapper.vm.fieldCtrl.isFocused).toBe(true)
    })
  })

  describe('validation', () => {
    it('should validate field', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      const result = await wrapper.vm.fieldCtrl.validate()

      expect(result).toBe(true)
    })

    it('should handle validation failures', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('')

      // Validate the field
      const result = await wrapper.vm.fieldCtrl.validate()
      await flushPromises()

      expect(result).toBe(false)
      expect(wrapper.vm.fieldCtrl.error).not.toBeNull()
    })
  })

  describe('HTML binding helpers', () => {
    it('should provide HTML binding attributes', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      // Access attrs
      const attrs = wrapper.vm.fieldCtrl.attrs

      // Check structure
      expect(attrs).toEqual(
        expect.objectContaining({
          value: expect.any(String),
          'aria-invalid': false,
        })
      )
    })

    it('should handle aria attributes for errors', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('')

      // Validate to trigger error
      await wrapper.vm.fieldCtrl.validate()
      await flushPromises()

      // Access attrs again after validation error
      const attrs = wrapper.vm.fieldCtrl.attrs

      // Check aria attributes
      expect(attrs['aria-invalid']).toBe(true)
      expect(attrs['aria-errormessage']).toBeDefined()
    })

    it('should handle input event from HTML element', async () => {
      const wrapper = mount(TestFieldComponent, {
        props: {
          name: 'name',
        },
      })

      // Create input event with mock target
      const input = wrapper.find('input')
      await input.element.dispatchEvent(new Event('input'))

      // Manually call the input handler with an object that has a target
      wrapper.vm.fieldCtrl.events.input({
        target: { value: 'Jane Doe' },
      })

      expect(wrapper.vm.form.name).toBe('Jane Doe')
    })
  })
})
