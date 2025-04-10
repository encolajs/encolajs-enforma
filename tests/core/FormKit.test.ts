import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import FormKit from '@/core/FormKit.vue'
import HeadlessForm from '@/headless/HeadlessForm'
import { setGlobalConfig } from '@/utils/useConfig'
import { h, inject } from 'vue'
import { formContextKey } from '@/constants/symbols'
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

describe('FormKit', () => {
  beforeEach(() => {
    // Reset global config before each test
    setGlobalConfig({
      components: {
        submitButton: 'SubmitButton',
        resetButton: 'ResetButton',
      },
      validateOn: 'submit',
      pt: {
        label: { class: 'formkit-label' },
        input: { class: 'formkit-input' },
        error: { class: 'formkit-error' },
        help: { class: 'formkit-help' },
        required: {
          text: '*',
          class: 'required-indicator',
        },
      },
    })
  })

  it('renders form with default slot content', async () => {
    const wrapper = mountTestComponent(
      FormKit,
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

    const wrapper = mountTestComponent(FormKit, {
      data: {},
      submitHandler: () => {},
      schema,
    })

    await wrapper.vm.$nextTick()
    const schemaComponent = wrapper.findComponent({ name: 'FormKitSchema' })
    expect(schemaComponent.exists()).toBe(true)
    expect(schemaComponent.props().schema).toEqual(schema)
  })

  it('emits submit-success event on successful form submission', async () => {
    const data = { name: 'test' }
    const wrapper = mount(FormKit, {
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

    const emitted = wrapper.emitted('submit-success')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual([data])
  })

  it('emits submit-error event when submission throws', async () => {
    const error = new Error('Submit failed')

    // Create a mock submit handler that throws an error
    const failingSubmitHandler = vi.fn().mockImplementation(() => {
      throw error
    })

    const wrapper = mount(FormKit, {
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

    // Check if submit-error was emitted with the right error
    const emitted = wrapper.emitted('submit-error')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual([error])
  })

  it('shows reset button by default', async () => {
    const wrapper = mount(FormKit, {
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
    const wrapper = mount(FormKit, {
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

  it('merges global and local config correctly', async () => {
    const localConfig = {
      validateOn: 'blur',
      components: {
        submitButton: 'CustomButton',
      },
    }

    // Create a stub for the custom component
    const CustomButtonStub = {
      name: 'CustomButton',
      template: '<button type="submit">Custom Submit</button>',
    }

    const wrapper = mount(FormKit, {
      props: {
        data: {},
        submitHandler: () => {},
        config: localConfig,
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
          CustomButton: CustomButtonStub,
        },
      },
    })

    await wrapper.vm.$nextTick()
    // Verify HeadlessForm receives the correct validateOn prop
    const headlessForm = wrapper.findComponent(HeadlessForm)
    expect(headlessForm.props().validateOn).toBe('blur')
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

    const wrapper = mount(FormKit, {
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

  it('passes custom validation rules to HeadlessForm', async () => {
    const rules = {
      name: 'required',
      email: 'email',
    }

    const wrapper = mount(FormKit, {
      props: {
        data: {},
        submitHandler: () => {},
        rules,
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
    expect(headlessForm.props().rules).toEqual(rules)
  })

  it('passes custom validation messages to HeadlessForm', async () => {
    const messages = {
      'name:required': 'This field is required',
      'email:email': 'Invalid email format',
    }

    const wrapper = mount(FormKit, {
      props: {
        data: {},
        submitHandler: () => {},
        messages,
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
    expect(headlessForm.props().customMessages).toEqual(messages)
  })
})
