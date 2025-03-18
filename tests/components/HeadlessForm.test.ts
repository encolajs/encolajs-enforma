import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import HeadlessForm from '../../src/components/HeadlessForm'
import { PlainObjectDataSource, ValidatorFactory } from '@encolajs/validator'

describe('HeadlessForm', () => {
  // Test data that will be used across tests
  const initialData = {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30
    }
  }

  const rules = {
    'name': 'required|min_length:2',
    'email': 'required|email',
    'profile.age': 'required|integer|gte:18'
  }

  const customMessages = {
    'email:required': 'Please enter your email',
    'email:email': 'Please enter a valid email'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides form state to slot', () => {
    const slotContent = vi.fn()

    mount(HeadlessForm, {
      props: {
        data: initialData,
        rules
      },
      slots: {
        default: slotContent
      }
    })

    // Check that slot was called with form state
    expect(slotContent).toHaveBeenCalled()
    const formState = slotContent.mock.calls[0][0]
    expect(formState.getData).toBeDefined()
    expect(formState.setFieldValue).toBeDefined()
    expect(formState.submit).toBeDefined()
  })

  it('prevents default form submission and calls submit handler', async () => {
    const submitHandler = vi.fn()
    let formSubmit: Function

    const wrapper = mount(HeadlessForm, {
      props: {
        data: initialData,
        rules,
        submitHandler
      },
      slots: {
        default: (formState: any) => {
          formSubmit = formState.submit
          return h('button', { type: 'submit' }, 'Submit')
        }
      }
    })

    // Trigger form submission
    await wrapper.find('form').trigger('submit')

    await flushPromises()

    // Check submit handler was called
    expect(submitHandler).toHaveBeenCalledWith(initialData)
  })

  it('handles field registration and validation', async () => {
    const TestComponent = {
      template: `
        <HeadlessForm 
          :data="formData" 
          :rules="formRules"
          @submit="onSubmit"
        >
          <template #default="formState">
            <form @submit="formState.submit">
              <input
                data-test="email-input"
                :value="formState.getFieldValue('email')"
                @input="e => formState.setFieldValue('email', e.target.value)"
                @blur="() => formState.touchField('email')"
              />
              <div v-if="formState.errors.email" data-test="email-error">
                {{ formState.errors.email[0] }}
              </div>
            </form>
          </template>
        </HeadlessForm>
      `,
      components: { HeadlessForm },
      data() {
        return {
          formData: initialData,
          formRules: rules
        }
      },
      methods: {
        onSubmit(data: any) {
          // Handle submit
        }
      }
    }

    const wrapper = mount(TestComponent)
    const input = wrapper.find('[data-test="email-input"]')

    // Change input value
    await input.setValue('new@email.com')

    // Get updated value from input
    expect(input.element.value).toBe('new@email.com')

    // Trigger blur to validate
    await input.trigger('blur')
  })

  it('handles nested fields', async () => {
    let formState: any

    const wrapper = mount(HeadlessForm, {
      props: {
        data: initialData,
        rules
      },
      slots: {
        default: (state: any) => {
          formState = state
          return h('input', {
            'data-test': 'age-input',
            value: state.getFieldValue('profile.age'),
            onInput: (e: Event) => state.setFieldValue('profile.age', (e.target as HTMLInputElement).value)
          })
        }
      }
    })

    const input = wrapper.find('[data-test="age-input"]')

    // Change nested field value
    await input.setValue('25')
    expect(formState.getFieldValue('profile.age')).toBe('25')
  })

  it('resets form state', async () => {
    const formStateRef = ref<any>(null)

    mount(HeadlessForm, {
      props: {
        data: initialData,
        rules
      },
      slots: {
        default: (formState: any) => {
          formStateRef.value = formState
          return h('button', { type: 'submit' }, 'Submit')
        }
      }
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

  it('validates form on submit', async () => {
    const wrapper = mount(HeadlessForm, {
      props: {
        data: initialData,
        rules,
        validateOn: 'submit'
      }
    })

    // Submit form
    await wrapper.find('form').trigger('submit')

    await flushPromises()

    // Check validation was performed
    expect(wrapper.emitted('submit')?.[0]).toEqual([initialData])
  })

  it('handles validation errors', async () => {
    // Mock validator to return errors
    vi.mocked(ValidatorFactory).mockImplementation(() => ({
      make: () => ({
        validate: vi.fn().mockResolvedValue(false),
        validatePath: vi.fn().mockResolvedValue(false),
        getErrors: vi.fn().mockReturnValue({
          email: ['Invalid email format']
        }),
        reset: vi.fn()
      })
    }))

    const TestComponent = {
      template: `
        <HeadlessForm 
          :data="formData" 
          :rules="formRules"
          @validation-error="onValidationError"
        >
          <template #default="formState">
            <form @submit.prevent="formState.submit">
              <input
                data-test="email-input"
                :value="formState.getFieldValue('email')"
                @input="e => formState.setFieldValue('email', e.target.value)"
              />
              <div v-if="formState.errors.email" data-test="email-error">
                {{ formState.errors.email[0] }}
              </div>
              <button type="submit">Submit</button>
            </form>
          </template>
        </HeadlessForm>
      `,
      components: { HeadlessForm },
      data() {
        return {
          formData: initialData,
          formRules: rules,
          validationError: null
        }
      },
      methods: {
        onValidationError(error: any) {
          this.validationError = error
        }
      }
    }

    const wrapper = mount(TestComponent)

    // Submit form
    await wrapper.find('button').trigger('click')

    await flushPromises()

    // Check error is displayed
    expect(wrapper.find('[data-test="email-error"]').text()).toBe('Invalid email format')
  })
  it('handles submit errors', async () => {
    const submitError = new Error('Submit failed')
    const submitHandler = vi.fn().mockRejectedValue(submitError)

    const wrapper = mount(HeadlessForm, {
      props: {
        data: initialData,
        rules,
        submitHandler
      }
    })

    // Submit form
    await wrapper.find('form').trigger('submit')

    await flushPromises()

    // Check error handling
    expect(wrapper.emitted('submit-error')?.[0]).toEqual([submitError])
  })

  it('integrates with nested fields', async () => {
    const wrapper = mount(HeadlessForm, {
      props: {
        data: initialData,
        rules
      },
      slots: {
        default: (props: any) => h('input', {
          value: props.getFieldValue('profile.age'),
          onInput: (e: Event) => props.setFieldValue('profile.age', (e.target as HTMLInputElement).value)
        })
      }
    })

    const input = wrapper.find('input')

    // Change nested field value
    await input.setValue(25)

    // Get updated value from input
    expect(input.element.value).toBe('25')
  })
})

