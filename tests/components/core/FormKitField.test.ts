// tests/components/core/FormKitField.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import FormKitField from '@/components/core/FormKitField.vue'
import { formConfigKey, formStateKey } from '@/constants/symbols'
import type { FormKitConfig } from '@/types/config'
import { useForm } from '@/composables/useForm'

// Unmock the useField composable to use the real implementation
vi.unmock('@/composables/useField')

// Create a proper form config that matches the expected type
const createFormConfig = (): FormKitConfig => ({
  pt: {
    wrapper: { class: 'form-field-wrapper' },
    label: { class: 'form-label' },
    input: { class: 'form-input' },
    error: { class: 'form-error' },
    help: { class: 'form-help' },
    required: {
      text: '*',
      class: 'required-indicator',
    },
    section: {},
  },
  behavior: {
    validateOn: 'change',
    showErrorsOn: 'dirty',
  },
  expressions: {
    delimiters: {
      start: '${',
      end: '}',
    },
  },
})

// Create actual form state using useForm
const createFormState = (initialValues = {}, rules = {}) => {
  return useForm(initialValues, rules)
}

describe('FormKitField', () => {
  // Create custom component stubs for testing
  const FormInputStub = {
    name: 'FormInput',
    template: '<input v-bind="$attrs" />',
    inheritAttrs: true,
  }

  let formState

  beforeEach(() => {
    // Create a fresh form state before each test
    formState = createFormState({})
  })

  it('renders a field with basic props', async () => {
    const wrapper = mount(FormKitField, {
      props: {
        name: 'test-field',
        label: 'Test Field',
        type: 'FormInput',
        inputProps: {
          type: 'text',
        },
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formState,
        },
      },
    })

    expect(wrapper.find('label').text()).toContain('Test Field')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('handles required fields correctly', async () => {
    const wrapper = mount(FormKitField, {
      props: {
        name: 'required-field',
        label: 'Required Field',
        type: 'FormInput',
        required: true,
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formState,
        },
      },
    })

    expect(wrapper.find('.required-indicator').exists()).toBe(true)
    expect(wrapper.find('.form-field-wrapper').classes()).toContain(
      'formkit-required'
    )
  })

  it('displays error messages when field has errors', async () => {
    // Create a form with initial value
    const formWithErrors = createFormState({ error_field: '' })

    // Manually set errors directly on the field state
    const fieldState = formWithErrors.getField('error_field')
    fieldState.$errors = ['This field is required']

    // Mount the component with the field that has errors
    const wrapper = mount(FormKitField, {
      props: {
        name: 'error_field',
        label: 'Error Field',
        type: 'FormInput',
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formWithErrors,
        },
      },
    })

    // Ensure reactive updates are processed
    await flushPromises()

    // Verify error message is displayed
    expect(wrapper.find('.form-error').text()).toBe('This field is required')
    expect(wrapper.find('.form-field-wrapper').classes()).toContain(
      'formkit-has-error'
    )
  })

  it('evaluates dynamic props correctly', async () => {
    const dynamicFormState = createFormState({ someField: 'test' })

    const wrapper = mount(FormKitField, {
      props: {
        name: 'dynamic-field',
        label: 'Dynamic Field',
        type: 'FormInput',
        inputProps: {
          disabled: '${form.someField === "test"}',
        },
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: dynamicFormState,
        },
      },
    })

    // Allow the dynamic props to be evaluated
    await flushPromises()

    expect(wrapper.find('input').attributes('disabled')).toBe('')
  })

  it('shows help text when provided', async () => {
    const wrapper = mount(FormKitField, {
      props: {
        name: 'help-field',
        label: 'Help Field',
        type: 'FormInput',
        help: 'This is a helpful message',
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formState,
        },
      },
    })

    expect(wrapper.find('.form-help').text()).toBe('This is a helpful message')
  })

  it('handles visibility toggle correctly', async () => {
    const wrapper = mount(FormKitField, {
      props: {
        name: 'visibility-field',
        label: 'Visibility Field',
        type: 'FormInput',
        if: false,
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formState,
        },
      },
    })

    // Vue's v-show doesn't actually remove the element but hides it with style="display: none"
    const wrapper_div = wrapper.find('.form-field-wrapper')
    expect(wrapper_div.exists()).toBe(true)
    expect(wrapper_div.attributes('style')).toContain('display: none')

    await wrapper.setProps({ if: true })
    // After changing to visible, the style should no longer contain display: none
    expect(wrapper.find('.form-field-wrapper').attributes('style')).toBeFalsy()
  })

  it('applies custom props correctly', async () => {
    const customProps = {
      labelProps: { class: 'custom-label' },
      inputProps: { class: 'custom-input', placeholder: 'Custom placeholder' },
      wrapperProps: { class: 'custom-wrapper' },
      errorProps: { class: 'custom-error' },
      helpProps: { class: 'custom-help' },
    }

    const wrapper = mount(FormKitField, {
      props: {
        name: 'custom-field',
        label: 'Custom Field',
        type: 'FormInput',
        ...customProps,
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: formState,
        },
      },
    })

    // Check for class attributes
    expect(wrapper.find('label').classes()).toContain('custom-label')

    // Check for the input with properties
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    // The input should have the custom-input class at some point in the component tree
    // Find the element that has the class
    const hasCustomInputClass = wrapper
      .findAll('*')
      .some((el) => el.classes().includes('custom-input'))
    expect(hasCustomInputClass).toBe(true)

    // Verify placeholder is properly passed
    expect(input.attributes('placeholder')).toBe('Custom placeholder')

    // Check if wrapper has custom class
    expect(wrapper.find('.form-field-wrapper').classes()).toContain(
      'custom-wrapper'
    )
  })

  it('handles field value changes', async () => {
    // Create a new form state
    const valueFormState = createFormState({ name: '' })

    const wrapper = mount(FormKitField, {
      props: {
        name: 'name',
        label: 'Input Field',
        type: 'FormInput',
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: valueFormState,
        },
      },
    })

    // Find input and trigger input event with new value
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    // We need to simulate the update event
    await input.setValue('new value')
    await flushPromises()

    // Verify the form state has been updated with our value
    expect(valueFormState['name']).toBe('new value')
  })

  it('renders custom component based on type', async () => {
    const CustomComponent = {
      name: 'CustomComponent',
      template: '<div class="custom-component">Custom Input</div>',
      props: ['modelValue'],
      emits: ['update:modelValue'],
    }

    // Create a modified config that includes our custom component
    const customConfig = createFormConfig()

    const wrapper = mount(FormKitField, {
      props: {
        name: 'custom-component-field',
        label: 'Custom Component Field',
        type: 'CustomComponent',
      },
      global: {
        components: {
          CustomComponent,
        },
        provide: {
          [formConfigKey]: customConfig,
          [formStateKey]: formState,
        },
      },
    })

    // Since the component is custom and registered globally,
    // we can check if it gets rendered
    expect(wrapper.findComponent(CustomComponent).exists()).toBe(true)
  })

  it('cleans up field on unmount', async () => {
    const cleanupFormState = createFormState({})
    const removeFieldSpy = vi.spyOn(cleanupFormState, 'removeField')

    const wrapper = mount(FormKitField, {
      props: {
        name: 'cleanup-field',
        label: 'Cleanup Field',
        type: 'FormInput',
      },
      global: {
        components: {
          FormInput: FormInputStub,
        },
        provide: {
          [formConfigKey]: createFormConfig(),
          [formStateKey]: cleanupFormState,
        },
      },
    })

    // Unmount component
    wrapper.unmount()

    // Check removeField was called
    expect(removeFieldSpy).toHaveBeenCalledWith('cleanup-field')
  })
})
