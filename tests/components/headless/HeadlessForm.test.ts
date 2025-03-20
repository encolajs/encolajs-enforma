import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config, flushPromises, mount } from '@vue/test-utils'
import { h, inject, ref } from 'vue'
import HeadlessForm from '../../../src/components/headless/HeadlessForm'
import { FormStateReturn } from '../../../src'

describe('HeadlessForm', () => {
  let encolaForm: FormStateReturn
  const FormStateExposer = {
    setup() {
      const formState = inject('encolaForm')
      encolaForm = formState as FormStateReturn
      return { formState }
    },
    template: '<div></div>',
  }

  // Register it globally for all tests
  config.global.components = {
    FormStateExposer,
  }

  // Test data that will be used across tests
  const initialData = {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30,
    },
  }

  const rules = {
    name: 'required|min_length:2',
    email: 'required|email',
    'profile.age': 'required|integer|gte:18',
  }

  const customMessages = {
    'email:required': 'Please enter your email',
    'email:email': 'Please enter a valid email',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('form state flow', () => {
    it('provides form state to default slot', () => {
      const slotContent = vi.fn()

      mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
        },
        slots: {
          default: slotContent,
        },
      })

      // Check that slot was called with form state
      expect(slotContent).toHaveBeenCalled()
      const formState = slotContent.mock.calls[0][0]
      expect(formState.getData).toBeDefined()
      expect(formState.setFieldValue).toBeDefined()
      expect(formState.submit).toBeDefined()
    })

    it('injects form state into child components', async () => {
      const TestComponent = {
        template: `
          <HeadlessForm :data="formData" :rules="formRules">
            <FormStateExposer />
          </HeadlessForm>
        `,
        components: { HeadlessForm },
        data() {
          return {
            formData: initialData,
            formRules: rules,
          }
        },
      }

      mount(TestComponent)

      // Check form state was injected
      expect(encolaForm.getData()).toEqual(initialData)
    })
  })

  describe('field handling', () => {
    it('field registration and validation', async () => {
      const TestComponent = {
        template: `
        <HeadlessForm 
          :data="formData" 
          :rules="formRules"
          @submit="onSubmit"
        >
          <template #default="formState">
            <FormStateExposer />
            <input
              data-test="email-input"
              :value="formState.getFieldValue('email')"
              @input="e => formState.setFieldValue('email', e.target.value)"
              @blur="() => formState.touchField('email')"
            />
            <div v-if="formState.errors.email" data-test="email-error">
              {{ formState.errors.email[0] }}
            </div>
          </template>
        </HeadlessForm>
      `,
        components: { HeadlessForm },
        data() {
          return {
            formData: initialData,
            formRules: rules,
          }
        },
        methods: {
          onSubmit(data: any) {
            console.log(data)
          },
        },
      }

      const wrapper = mount(TestComponent)
      const emailInput = wrapper.find('[data-test="email-input"]')

      // Change input value
      await emailInput.setValue('new@email.com')
      // only after interacting with the input,
      // the field is registered in teh form state
      // because were not using the headless field component
      const emailField = encolaForm.getField('email')
      // Trigger blur to validate
      await emailInput.trigger('blur')
      await flushPromises()

      // Get updated value from input
      expect(emailField?.value).toBe('new@email.com')
      expect(emailField?.isValidating).toBe(false)
      expect(emailField?.isTouched).toBe(true)
      expect(emailField?.isDirty).toBe(true)
      expect(emailField?.isValid).toBe(true)
    })

    it('nested field', async () => {
      let formState: any

      const wrapper = mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
        },
        slots: {
          default: (state: any) => {
            formState = state
            return h('input', {
              'data-test': 'age-input',
              value: state.getFieldValue('profile.age'),
              onInput: (e: Event) =>
                state.setFieldValue(
                  'profile.age',
                  (e.target as HTMLInputElement).value
                ),
            })
          },
        },
      })

      const input = wrapper.find('[data-test="age-input"]')

      // Change nested field value
      await input.setValue('25')
      expect(formState.getFieldValue('profile.age')).toBe('25')
    })
  })

  describe('form submission', () => {
    it('prevents default form submission and calls submit handler', async () => {
      const submitHandler = vi.fn()

      const wrapper = mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
          submitHandler,
        },
        slots: {
          default: (formState: any) => {
            return h('button', { type: 'submit' }, 'Submit')
          },
        },
      })

      // Trigger form submission
      await wrapper.find('form').trigger('submit')

      await flushPromises()

      // Check submit handler was called
      expect(submitHandler).toHaveBeenCalledWith(initialData)
    })

    it('validates form on submit', async () => {
      const wrapper = mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
          validateOn: 'submit',
        },
      })

      // Submit form
      await wrapper.find('form').trigger('submit')

      await flushPromises()

      // Check validation was performed
      expect(wrapper.emitted('submit')?.[0]).toEqual([initialData])
    })

    it('handles submit errors', async () => {
      const submitError = new Error('Submit failed')
      const submitHandler = vi.fn().mockRejectedValue(submitError)

      const wrapper = mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
          submitHandler,
        },
      })

      // Submit form
      await wrapper.find('form').trigger('submit')

      await flushPromises()

      // Check error handling
      expect(wrapper.emitted('submit-error')?.[0]).toEqual([submitError])
    })

    it('handles validation errors', async () => {
      const TestComponent = {
        template: `
        <HeadlessForm 
          :data="formData" 
          :rules="formRules"
          :custom-messages="customMessages"
          @validation-error="onValidationError"
        >
          <template #default="formState">
            <input
              data-test="email-input"
              :value="formState.getFieldValue('email')"
              @input="e => formState.setFieldValue('email', e.target.value)"
            />
            <div v-if="formState.errors.email" data-test="email-error">
              {{ formState.errors.email[0] }}
            </div>
            <button type="submit">Submit</button>
          </template>
        </HeadlessForm>
      `,
        components: { HeadlessForm },
        data() {
          return {
            formData: {
              ...initialData,
              email: 'not an email',
            },
            formRules: rules,
            customMessages,
            validationError: null,
          }
        },
        methods: {
          onValidationError(error: any) {
            this.validationError = error
          },
        },
      }

      const wrapper = mount(TestComponent)

      // Submit form
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Check error is displayed
      expect(wrapper.find('[data-test="email-error"]').text()).toBe(
        'This field must be a valid email address'
      )
    })

    it('resets form state', async () => {
      const formStateRef = ref<any>(null)

      mount(HeadlessForm, {
        props: {
          data: initialData,
          rules,
        },
        slots: {
          default: (formState: any) => {
            formStateRef.value = formState
            return h('button', { type: 'submit' }, 'Submit')
          },
        },
      })

      // Modify form state
      formStateRef.value.setFieldValue('name', 'Jane')
      formStateRef.value.touchField('name')
      await flushPromises()

      // Reset form
      formStateRef.value.reset()
      await flushPromises()

      // Check state was reset
      expect(formStateRef.value.getField('name')?.isTouched).toBe(false)
      expect(formStateRef.value.isDirty).toBe(false)
      expect(formStateRef.value.getFieldValue('name')).toBe('John')
    })
  })

  describe('error handling', () => {
    it('handles circular references in data', () => {
      const circularData: any = { name: 'John' }
      circularData.self = circularData

      const wrapper = mount(HeadlessForm, {
        props: {
          data: circularData,
          rules,
        },
      })

      expect(() => wrapper.find('form').trigger('submit')).not.toThrow()
    })
  })
})
