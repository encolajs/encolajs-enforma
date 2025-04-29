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

  it('passes inputEvents properly to the input component', async () => {
    // Setup a form with a field
    const testForm = createFormState({ events_field: 'test' })

    // Mount the field component
    const wrapper = mountTestComponent(
      EnformaField,
      {
        name: 'events_field',
        label: 'Events Field',
      },
      {
        global: {
          provide: {
            [formControllerKey]: testForm,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Get the component instance to access internal properties
    const vm = wrapper.vm as any

    // Verify that inputEvents are being passed to the component
    expect(vm.props.inputEvents).toBeDefined()
    expect(typeof vm.props.inputEvents.input).toBe('function')
    expect(typeof vm.props.inputEvents.change).toBe('function')
    expect(typeof vm.props.inputEvents.blur).toBe('function')
    expect(typeof vm.props.inputEvents.focus).toBe('function')
  })

  it('uses update:modelValue event when useModelValue is true', async () => {
    // Setup a form with a field
    const testForm = createFormState({ model_value_field: 'test' })

    // Mount the field component with useModelValue set to true
    const wrapper = mountTestComponent(
      EnformaField,
      {
        name: 'model_value_field',
        label: 'Model Value Field',
        useModelValue: true,
      },
      {
        global: {
          provide: {
            [formControllerKey]: testForm,
            [formSchemaKey]: schema,
          },
        },
      }
    )

    // Get the component instance to access internal properties
    const vm = wrapper.vm as any

    // Verify the inputEvents structure when useModelValue is true
    expect(vm.props.inputEvents).toBeDefined()
    expect(vm.props.inputEvents.input).toBeUndefined() // input should be removed
    expect(vm.props.inputEvents.change).toBeUndefined() // change should be removed
    expect(typeof vm.props.inputEvents['update:modelValue']).toBe('function') // update:modelValue should be added
    expect(typeof vm.props.inputEvents.blur).toBe('function') // blur should still be there
    expect(typeof vm.props.inputEvents.focus).toBe('function') // focus should still be there

    // Test that update:modelValue handler updates the field value
    const newValue = 'updated value'
    vm.props.inputEvents['update:modelValue'](newValue)

    // Verify the field value was updated
    expect(testForm.getFieldValue('model_value_field')).toBe(newValue)
  })
})
