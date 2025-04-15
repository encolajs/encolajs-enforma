import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config, flushPromises, mount } from '@vue/test-utils'
import { h, inject } from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import HeadlessField from '@/headless/HeadlessField'
import { formStateKey } from '@/constants/symbols'

import { FormController } from '../../src'

// We'll use a real validator in these tests
vi.mock('@encolajs/validator', async () => {
  const actual = await vi.importActual('@encolajs/validator')
  return {
    ...actual,
    // If we need to spy on some methods, we can do that here
    ValidatorFactory: actual.ValidatorFactory,
  }
})

describe('HeadlessForm', () => {
  let encolaForm: FormController
  const FormStateExposer = {
    setup() {
      const formState = inject(formStateKey)
      encolaForm = formState as FormController
      return {
        [formStateKey]: formState,
      }
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

      // Check that slot was called with form proxy
      expect(slotContent).toHaveBeenCalled()
      const form = slotContent.mock.calls[0][0]
      expect(form.validate).toBeDefined()
      expect(form.submit).toBeDefined()
      expect(form.reset).toBeDefined()

      // Check data properties exist on the form
      expect(form.name).toBe('John')
      expect(form.email).toBe('john@example.com')
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

      // Check form proxy was injected
      expect(encolaForm.name).toEqual('John')
      expect(encolaForm.email).toEqual('john@example.com')
    })
  })

  describe('field handling', () => {
    it('field access and updates', async () => {
      const TestComponent = {
        template: `
        <HeadlessForm 
          :data="formData" 
          :rules="formRules"
          @submit="onSubmit"
        >
          <template #default="form">
            <FormStateExposer />
            <input
              data-test="email-input"
              :value="form.email"
              @input="e => form.email = e.target.value"
              @blur="() => form['email.$isTouched'] = true"
            />
          </template>
        </HeadlessForm>
      `,
        components: { HeadlessForm },
        data() {
          return {
            formData: { ...initialData },
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

      // Verify the form's value was updated
      expect(encolaForm.email).toBe('new@email.com')

      // Trigger blur to set touched state
      await emailInput.trigger('blur')
      await flushPromises()

      // Verify touched state was set
      expect(encolaForm['email.$isTouched']).toBe(true)
    })

    it('nested field access', async () => {
      let form: any

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
          rules,
        },
        slots: {
          default: (formState: any) => {
            form = formState
            return h('input', {
              'data-test': 'age-input',
              value: formState['profile.age'],
              onInput: (e: Event) => {
                formState['profile.age'] = (e.target as HTMLInputElement).value
              },
            })
          },
        },
      })

      const input = wrapper.find('[data-test="age-input"]')

      // Change nested field value
      await input.setValue('25')
      expect(form['profile.age']).toBe('25')
    })
  })

  describe('form submission', () => {
    it('prevents default form submission and calls submit handler', async () => {
      const submitHandler = vi.fn()

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
          rules,
          submitHandler,
        },
        slots: {
          default: (form: any) => {
            return h('button', { type: 'submit' }, 'Submit')
          },
        },
      })

      // Trigger form submission
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Check submit handler was called with form data
      expect(submitHandler).toHaveBeenCalled()
      const submitData = submitHandler.mock.calls[0][0]
      expect(submitData.name).toBe('John')
      expect(submitData.email).toBe('john@example.com')
    })

    it('validates form on submit', async () => {
      const submitSpy = vi.fn()

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
          rules,
          submitHandler: submitSpy,
        },
      })

      // Submit form
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Check validation succeeded and submit was emitted
      expect(submitSpy).toHaveBeenCalled()
      expect(wrapper.emitted('submit-success')).toBeTruthy()
    })

    it('emits validation-error when validation fails', async () => {
      // Create a form with invalid data that will fail validation
      const invalidData = {
        name: '', // Empty name will fail required validation
        email: 'not-an-email', // Invalid email format
        profile: {
          age: 15, // Under 18 will fail age validation
        },
      }

      let formProxy: FormController

      const wrapper = mount(HeadlessForm, {
        props: {
          data: invalidData,
          rules,
        },
        slots: {
          default: (form: FormController) => {
            formProxy = form

            // Register fields by accessing them through getField
            form.getField('name')
            form.getField('email')
            form.getField('profile.age')

            return h('button', { type: 'submit' }, 'Submit')
          },
        },
      })

      await wrapper.vm.$nextTick()

      // Submit the form
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Check that validation-error was emitted
      expect(wrapper.emitted('validation-error')).toBeTruthy()
    })

    it('handles submit errors', async () => {
      const submitError = new Error('Submit failed')
      const submitHandler = vi.fn().mockRejectedValue(submitError)

      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
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
  })

  describe('form reset', () => {
    it('resets form state and emits reset event', async () => {
      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
          rules,
        },
        slots: {
          default: (form: any) => {
            return [
              h('input', {
                'data-test': 'name-input',
                value: form.name,
                onInput: (e: Event) => {
                  form.name = (e.target as HTMLInputElement).value
                },
              }),
              h(
                'button',
                {
                  type: 'reset',
                  'data-test': 'reset-button',
                },
                'Reset'
              ),
            ]
          },
        },
      })

      // Change a value
      const input = wrapper.find('[data-test="name-input"]')
      await input.setValue('Jane')

      // @ts-expect-error wrapper.vm is a FormProxy
      expect(wrapper.vm.values().name).toBe('Jane')

      // Trigger reset
      await wrapper.find('form').trigger('reset')
      await flushPromises()

      // Check reset was called and event emitted
      expect(wrapper.emitted('reset')).toBeTruthy()

      // Check data was reset to initial value
      // @ts-expect-error wrapper.vm is a FormProxy
      expect(wrapper.vm.values().name).toBe('John')
    })
  })

  describe('component API', () => {
    it('exposes form methods via expose', async () => {
      const wrapper = mount(HeadlessForm, {
        props: {
          data: { ...initialData },
          rules,
        },
      })

      // Check exposed methods
      expect(wrapper.vm).toHaveProperty('reset')
      expect(wrapper.vm).toHaveProperty('submit')
      expect(wrapper.vm).toHaveProperty('validate')
      expect(wrapper.vm).toHaveProperty('validateField')
      expect(wrapper.vm).toHaveProperty('setFieldValue')
      expect(wrapper.vm).toHaveProperty('getField')
      expect(wrapper.vm).toHaveProperty('values')

      // Test a method
      // @ts-expect-error wrapper.vm is a FormProxy
      const data = wrapper.vm.values()
      expect(data.name).toBe('John')
      expect(data.email).toBe('john@example.com')
    })
  })

  describe('form state after validation', () => {
    it('should mark fields as touched and show error messages after form submission', async () => {
      // Create a test component that includes HeadlessField for proper rendering
      const TestComponent = {
        template: `
          <HeadlessForm 
            :data="formData" 
            :rules="formRules"
          >
            <template #default="form">
              <FormStateExposer />
              <HeadlessField name="email">
                <template #default="{ value, attrs, error, events, id }">
                  <div>
                    <input
                      data-test="email-input"
                      v-bind="attrs"
                      v-on="events"
                    />
                    <div v-if="error" data-test="error-message" class="error-message">
                      {{ error }}
                    </div>
                  </div>
                </template>
              </HeadlessField>
              <button type="submit" data-test="submit-button">Submit</button>
            </template>
          </HeadlessForm>
        `,
        components: { HeadlessForm, HeadlessField, FormStateExposer },
        data() {
          return {
            formData: { email: 'invalid-email' },
            formRules: { email: 'required|email' },
          }
        },
      }

      const wrapper = mount(TestComponent)

      // Submit the form to trigger validation
      await wrapper.find('[data-test="submit-button"]').trigger('click')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Get form controller from HeadlessForm component
      const formController = wrapper.findComponent(HeadlessForm).vm

      // Check state directly on the controller after validation
      const emailState = encolaForm.getField('email')

      // The form should mark fields as touched and set errors
      expect(emailState.$isTouched).toBe(true)
      expect(emailState.$isDirty).toBe(true)
      expect(emailState.$errors.length).toBeGreaterThan(0)
      expect(emailState.$errors[0]).toContain('email')

      // Check that the error message is displayed in the DOM
      const errorMessage = wrapper.find('[data-test="error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('email')
    })
  })
})
