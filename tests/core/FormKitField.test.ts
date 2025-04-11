// tests/core/FormKitField.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import FormKitField from '@/core/FormKitField.vue'
// @ts-ignore
import { formStateKey, formSchemaKey } from '@/constants/symbols'
// @ts-ignore
import { useForm } from '@/headless/useForm'
import { mountTestComponent } from '../utils/testSetup'

// Unmock the useField composable to use the real implementation
vi.unmock('@/composables/useField')

// Create actual form state using useForm
const createFormState = (initialValues = {}, rules = {}) => {
  return useForm(initialValues, rules)
}

describe('FormKitField', () => {
  let formState
  let schema

  beforeEach(() => {
    // Create a fresh form state before each test
    formState = createFormState({})
    // Create a basic schema for testing
    schema = {
      fields: {},
    }
  })

  it('renders a field with basic props', async () => {
    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'test-field',
        label: 'Test Field',
        type: 'input',
        inputProps: {
          type: 'text',
        },
      },
      {
        global: {
          provide: {
            [formStateKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    expect(wrapper.find('label').text()).toContain('Test Field')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('handles required fields correctly', async () => {
    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'required-field',
        label: 'Required Field',
        type: 'input',
        required: true,
      },
      {
        global: {
          provide: {
            [formStateKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    expect(wrapper.find('.formkit-label-required').exists()).toBe(true)
  })

  it('displays error messages when field has errors', async () => {
    // Create a form with initial value
    const formWithErrors = createFormState({ error_field: '' })

    // Manually set errors directly on the field state
    const fieldState = formWithErrors.getField('error_field')
    fieldState.$errors = ['This field is required']

    // Mount the component with the field that has errors
    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'error_field',
        label: 'Error Field',
        type: 'input',
      },
      {
        global: {
          provide: {
            [formStateKey]: formWithErrors,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Ensure reactive updates are processed
    await flushPromises()

    // Verify error message is displayed
    expect(wrapper.find('.formkit-error').text()).toBe('This field is required')
  })

  it('evaluates dynamic props correctly', async () => {
    const dynamicFormState = createFormState({ someField: 'test' })

    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'dynamic-field',
        label: 'Dynamic Field',
        type: 'input',
        inputProps: {
          'data-test': '${form.someField === "test" ? "ok" : "notok"}',
          disabled: '${form.someField === "test"}',
        },
      },
      {
        global: {
          provide: {
            [formStateKey]: dynamicFormState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Allow the dynamic props to be evaluated
    await flushPromises()

    // Initially, the field should be disabled since someField === "test"
    expect(wrapper.find('input').attributes('data-test')).toBe('ok')
    expect(wrapper.find('input').element.disabled).toBe(true)

    // Change the form value to make the condition false
    dynamicFormState.someField = 'different'
    await flushPromises()

    // Now the field should be enabled since someField !== "test"
    expect(wrapper.find('input').attributes('data-test')).toBe('notok')
    expect(wrapper.find('input').element.disabled).toBe(false)
  })

  it('shows help text when provided', async () => {
    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'help-field',
        label: 'Help Field',
        type: 'input',
        help: 'This is a helpful message',
      },
      {
        global: {
          provide: {
            [formStateKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    expect(wrapper.find('.formkit-help').text()).toBe(
      'This is a helpful message'
    )
  })

  it('handles visibility toggle correctly', async () => {
    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'visibility-field',
        label: 'Visibility Field',
        type: 'input',
        if: false,
      },
      {
        global: {
          provide: {
            [formStateKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Vue's v-show doesn't actually remove the element but hides it with style="display: none"
    const wrapper_div = wrapper.find('.formkit-field-wrapper')
    expect(wrapper_div.exists()).toBe(true)
    expect(wrapper_div.attributes('style')).toContain('display: none')

    await wrapper.setProps({ if: true })
    // After changing to visible, the style should no longer contain display: none
    expect(
      wrapper.find('.formkit-field-wrapper').attributes('style')
    ).toBeFalsy()
  })

  it('applies custom props correctly', async () => {
    const customProps = {
      labelProps: { class: 'custom-label' },
      inputProps: { class: 'custom-input', placeholder: 'Custom placeholder' },
      errorProps: { class: 'custom-error' },
      helpProps: { class: 'custom-help' },
    }

    const wrapper = mountTestComponent(
      FormKitField,
      {
        name: 'custom-field',
        label: 'Custom Field',
        type: 'input',
        ...customProps,
      },
      {
        global: {
          provide: {
            [formStateKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Check that custom classes are applied
    expect(wrapper.find('.custom-label').exists()).toBe(true)
    expect(wrapper.find('.custom-input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe(
      'Custom placeholder'
    )
  })
})
