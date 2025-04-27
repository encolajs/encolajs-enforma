// tests/core/EnformaField.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import EnformaField from '../../src/core/EnformaField.vue'
// @ts-ignore
import { formControllerKey, formSchemaKey } from '@/constants/symbols'
// @ts-ignore
import { useForm } from '@/headless/useForm'
import { mountTestComponent } from '../utils/testSetup'

// Unmock the useField composable to use the real implementation
vi.unmock('@/composables/useField')

// Create actual form state using useForm
const createFormState = (initialValues = {}, rules = {}) => {
  return useForm(initialValues, rules)
}

describe('EnformaField', () => {
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
      EnformaField,
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
            [formControllerKey]: formState,
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
      EnformaField,
      {
        name: 'required-field',
        label: 'Required Field',
        type: 'input',
        required: true,
      },
      {
        global: {
          provide: {
            [formControllerKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    expect(wrapper.find('.enforma-label-required').exists()).toBe(true)
  })

  it('displays error messages when field has errors', async () => {
    // Create a form with initial value
    const formWithErrors = createFormState({ error_field: '' })

    // Manually set errors directly on the field state
    const fieldController = formWithErrors.getField('error_field')
    fieldController.$errors.value = ['This field is required']

    // Mount the component with the field that has errors
    const wrapper = mountTestComponent(
      EnformaField,
      {
        name: 'error_field',
        label: 'Error Field',
        type: 'input',
      },
      {
        global: {
          provide: {
            [formControllerKey]: formWithErrors,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Ensure reactive updates are processed
    await flushPromises()

    // Verify error message is displayed
    expect(wrapper.find('.enforma-error').text()).toBe('This field is required')
  })

  it('shows help text when provided', async () => {
    const wrapper = mountTestComponent(
      EnformaField,
      {
        name: 'help-field',
        label: 'Help Field',
        type: 'input',
        help: 'This is a helpful message',
      },
      {
        global: {
          provide: {
            [formControllerKey]: formState,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    expect(wrapper.find('.enforma-help').text()).toBe(
      'This is a helpful message'
    )
  })

  it('applies custom props correctly', async () => {
    const customProps = {
      labelProps: { class: 'custom-label' },
      inputProps: { class: 'custom-input', placeholder: 'Custom placeholder' },
      errorProps: { class: 'custom-error' },
      helpProps: { class: 'custom-help' },
    }

    const wrapper = mountTestComponent(
      EnformaField,
      {
        name: 'custom-field',
        label: 'Custom Field',
        type: 'input',
        ...customProps,
      },
      {
        global: {
          provide: {
            [formControllerKey]: formState,
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
