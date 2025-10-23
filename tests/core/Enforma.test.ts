import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import EnformaSchema from '@/core/EnformaSchema.vue'
import EnformaSection from '@/core/EnformaSection.vue'
import EnformaField from '@/core/EnformaField.vue'
import HeadlessForm from '../../src/headless/HeadlessForm'
import { getGlobalConfig, setGlobalConfig } from '../../src/utils/useConfig'
import { h, inject } from 'vue'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
  fieldRulesCollectorKey,
} from '../../src/constants/symbols'
import { mountTestComponent } from '../utils/testSetup'

// Stub components for testing
const SubmitButtonStub = {
  name: 'SubmitButton',
  template: '<button type="submit">Submit</button>',
  props: ['disabled'],
}

const ResetButtonStub = {
  name: 'ResetButton',
  template: '<button type="reset">Reset</button>',
  props: ['disabled'],
}

describe('Enforma', () => {
  beforeEach(() => {
    const currentConfig = getGlobalConfig()
    // Reset global config before each test
    setGlobalConfig({
      ...currentConfig,
      components: {
        submitButton: 'SubmitButton',
        resetButton: 'ResetButton',
      },
      validateOn: 'submit',
      pt: {
        label: { class: 'enforma-label' },
        input: { class: 'enforma-input' },
        error: { class: 'enforma-error' },
        help: { class: 'enforma-help' },
        required: {
          text: '*',
          class: 'required-indicator',
        },
      },
      behavior: currentConfig.behavior,
    })
  })

  it('renders form with default slot content', async () => {
    const wrapper = mountTestComponent(
      Enforma,
      {
        data: {},
        submitHandler: () => {},
      },
      {
        global: {
          components: {
            SubmitButton: SubmitButtonStub,
            ResetButton: ResetButtonStub,
          },
        },
      },
      {
        default: '<div class="test-content">Test Content</div>',
      }
    )

    await wrapper.vm.$nextTick()
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('Test Content')
  })

  it('renders form with schema when provided', async () => {
    const schema = {
      name: {
        label: 'Name',
        type: 'input',
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: {},
      submitHandler: () => {},
      schema,
    })

    await wrapper.vm.$nextTick()
    const schemaComponent = wrapper.findComponent({ name: 'EnformaSchema' })
    expect(schemaComponent.exists()).toBe(true)
    expect(schemaComponent.props().schema).toEqual(schema)
  })

  it('handles field visibility in schema with if property', async () => {
    // Create a simple form state schema with conditional fields
    const schema = {
      visibleField: {
        label: 'Visible Field',
        type: 'field',
        if: true,
      },
      hiddenField: {
        label: 'Hidden Field',
        type: 'field',
        if: false,
      },
    }

    // First setup the global config with all necessary components
    const currentConfig = getGlobalConfig()
    setGlobalConfig({
      ...currentConfig,
      components: {
        submitButton: 'button',
        resetButton: 'button',
        field: EnformaField,
        section: EnformaSection,
        schema: EnformaSchema,
      },
      pt: {
        wrapper: { class: 'field-wrapper' },
      },
    })

    // Use a stub for the EnformaField component to make testing easier
    const FieldStub = {
      name: 'EnformaField',
      template:
        '<div :data-field-name="name" class="field-stub">{{ label }}</div>',
      props: ['name', 'label', 'inputComponent'],
    }

    // Mount the Enforma component with the schema
    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
        schema,
      },
      global: {},
    })

    await wrapper.vm.$nextTick()
    await flushPromises() // Wait for all promises to resolve

    // Check for the visible field
    const visibleFieldElement = wrapper.find('[name="visibleField"]')
    expect(visibleFieldElement.exists()).toBe(true)

    // The hidden field should not be in the DOM
    const hiddenFieldElement = wrapper.find('[name="hiddenField"]')
    expect(hiddenFieldElement.exists()).toBe(false)
  })

  it('emits submit_success event on successful form submission', async () => {
    const data = { name: 'test' }
    const wrapper = mount(Enforma, {
      props: {
        data: data,
        submitHandler: () => Promise.resolve(true),
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    await form.trigger('submit')
    await flushPromises()

    const emitted = wrapper.emitted('submit_success')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual([data])
  })

  it('emits submit_error event when submission throws', async () => {
    const error = new Error('Submit failed')

    // Create a mock submit handler that throws an error
    const failingSubmitHandler = vi.fn().mockImplementation(() => {
      throw error
    })

    const wrapper = mount(Enforma, {
      props: {
        data: {},
        // Use our failing submit handler
        submitHandler: failingSubmitHandler,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()

    // Find the form and trigger submission
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()

    // Check if submit_error was emitted with the right error
    const emitted = wrapper.emitted('submit_error')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual([error])
  })

  it('shows reset button by default', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    // Look for the reset button component
    const resetButtons = wrapper.findAllComponents(ResetButtonStub)
    expect(resetButtons.length).toBeGreaterThan(0)
  })

  it('hides reset button when showResetButton is false', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
        showResetButton: false,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    // Should not find any reset button components
    const resetButtons = wrapper.findAllComponents(ResetButtonStub)
    expect(resetButtons.length).toBe(0)
  })

  it('provides form context to child components', async () => {
    const context = { foo: 'bar' }

    // Define the test child component with proper injection
    const TestChild = {
      name: 'TestChild',
      template: '<div class="test-child">{{ injectedContext?.foo }}</div>',
      setup() {
        // Use the proper symbol from the constants
        const injectedContext = inject(formContextKey, {})
        return { injectedContext }
      },
    }

    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
        context,
      },
      slots: {
        default: () => h(TestChild),
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
          TestChild,
        },
      },
    })

    await wrapper.vm.$nextTick()

    // Find the component and check its content
    const childComponent = wrapper.findComponent(TestChild)
    expect(childComponent.exists()).toBe(true)
    expect(childComponent.text()).toContain('bar')
  })

  it('passes custom validator to HeadlessForm', async () => {
    const { createEncolaValidator } = await import(
      '@/validators/encolaValidator'
    )
    const validator = createEncolaValidator({
      name: 'required',
      email: 'email',
    })

    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
        validator,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    const headlessForm = wrapper.findComponent(HeadlessForm)
    expect(headlessForm.props().validator).toBeDefined()
    expect(headlessForm.props().validator.validate).toBeDefined()
  })

  it('passes custom validator with messages to HeadlessForm', async () => {
    const { createEncolaValidator } = await import(
      '@/validators/encolaValidator'
    )
    const messages = {
      'name:required': 'This field is required',
      'email:email': 'Invalid email format',
    }

    const validator = createEncolaValidator(
      {
        name: 'required',
        email: 'email',
      },
      messages
    )

    const wrapper = mount(Enforma, {
      props: {
        data: {},
        submitHandler: () => {},
        validator,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    const headlessForm = wrapper.findComponent(HeadlessForm)
    expect(headlessForm.props().validator).toBeDefined()
    expect(headlessForm.props().validator.validate).toBeDefined()
  })

  it('collects and merges field-level rules and messages', async () => {
    const data = { email: '', name: '', phone: '' }
    const submitHandler = vi.fn()

    // Test component that includes EnformaField components with field-level validation
    const TestComponent = {
      name: 'TestComponent',
      template: `
        <Enforma :data="data" :submit-handler="submitHandler">
          <EnformaField 
            name="email" 
            label="Email" 
            rules="required|email"
            :messages="{ required: 'Email is required', email: 'Invalid email format' }"
          />
          <EnformaField 
            name="name" 
            label="Name" 
            rules="required|min:2"
            :messages="{ required: 'Name is required', min: 'Name must be at least 2 characters' }"
          />
          <EnformaField 
            name="phone" 
            label="Phone"
          />
        </Enforma>
      `,
      props: ['data', 'submitHandler'],
      components: {
        Enforma,
        EnformaField,
      },
    }

    const wrapper = mount(TestComponent, {
      props: {
        data,
        submitHandler,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // Get the HeadlessForm component
    const headlessForm = wrapper.findComponent(HeadlessForm)

    // Verify that field-level rules were collected and merged
    const effectiveRules = headlessForm.props().rules
    expect(effectiveRules).toHaveProperty('email', 'required|email')
    expect(effectiveRules).toHaveProperty('name', 'required|min:2')
    expect(effectiveRules).not.toHaveProperty('phone') // No rules for phone field

    // Verify that field-level messages were collected and merged (flat format)
    const effectiveMessages = headlessForm.props().customMessages
    expect(effectiveMessages).toHaveProperty(
      'email:required',
      'Email is required'
    )
    expect(effectiveMessages).toHaveProperty(
      'email:email',
      'Invalid email format'
    )
    expect(effectiveMessages).toHaveProperty(
      'name:required',
      'Name is required'
    )
    expect(effectiveMessages).toHaveProperty(
      'name:min',
      'Name must be at least 2 characters'
    )
    expect(effectiveMessages).not.toHaveProperty('phone:required') // No messages for phone field
  })

  it('gives precedence to form-level rules over field-level rules', async () => {
    const data = { email: '' }
    const submitHandler = vi.fn()
    const formRules = { email: 'required|min:5' } // Form-level rule that should override field-level
    const formMessages = { 'email:required': 'Form-level required message' } // Form-level message in flat format

    const TestComponent = {
      name: 'TestComponent',
      template: `
        <Enforma :data="data" :rules="formRules" :messages="formMessages" :submit-handler="submitHandler">
          <EnformaField 
            name="email" 
            label="Email" 
            rules="required|email"
            :messages="{ required: 'Field-level required message', email: 'Invalid email' }"
          />
        </Enforma>
      `,
      props: ['data', 'submitHandler', 'formRules', 'formMessages'],
      components: {
        Enforma,
        EnformaField,
      },
    }

    const wrapper = mount(TestComponent, {
      props: {
        data,
        submitHandler,
        formRules,
        formMessages,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // Get the HeadlessForm component
    const headlessForm = wrapper.findComponent(HeadlessForm)

    // Verify that form-level rules take precedence
    const effectiveRules = headlessForm.props().rules
    expect(effectiveRules.email).toBe('required|min:5') // Form-level rule should win

    // Verify that form-level messages take precedence but field-level messages are still available
    const effectiveMessages = headlessForm.props().customMessages
    expect(effectiveMessages['email:required']).toBe(
      'Form-level required message'
    ) // Form-level should win
    expect(effectiveMessages['email:email']).toBe('Invalid email') // Field-level should still be available if not overridden
  })
})
