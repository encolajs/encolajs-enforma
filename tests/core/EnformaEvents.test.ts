import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'

describe('Enforma Events', () => {
  let wrapper
  const submitHandler = vi.fn()

  beforeEach(() => {
    wrapper = mount(Enforma, {
      props: {
        data: {
          name: 'Test User',
          email: 'test@example.com',
        },
        submitHandler,
      },
      slots: {
        default: `
          <div>
            <input data-test="name" v-model="name" />
            <input data-test="email" v-model="email" />
          </div>
        `,
      },
    })
  })

  it('emits field_change event when a field value changes', async () => {
    // Get the form state from the slot
    const formRef = wrapper.vm.form

    // Set up a mock for the field_change event
    const eventHandler = vi.fn()
    formRef.on('field_changed', eventHandler)

    // Change a field value
    await formRef.setFieldValue('name', 'New Name')

    // Check that the event was emitted
    expect(eventHandler).toHaveBeenCalled()

    // Check the event details
    const eventData = eventHandler.mock.calls[0][0]
    expect(eventData.path).toBe('name')
    expect(eventData.value).toBe('New Name')
    expect(eventData.fieldController).toBeDefined()
    expect(eventData.formController).toBeDefined()
  })

  it('emits field_focus and field_blur events', async () => {
    // Get the form state from the slot
    const formRef = wrapper.vm.form

    // Set up mocks for the events
    const focusHandler = vi.fn()
    const blurHandler = vi.fn()

    formRef.on('field_focused', focusHandler)
    formRef.on('field_blurred', blurHandler)

    // Trigger focus and blur
    formRef.setFieldFocused('name')
    formRef.setFieldBlurred('name')

    // Check that events were emitted
    expect(focusHandler).toHaveBeenCalled()
    expect(blurHandler).toHaveBeenCalled()
  })

  it('exposes on() and off() convenience methods', async () => {
    // Get the component instance
    const form = wrapper.vm.form

    // Set up a mock for the field_change event
    const eventHandler = vi.fn()

    // Use the convenience method to register event handler
    const subscription = form.on('field_changed', eventHandler)

    // Check that we can change a field value
    await form.setFieldValue('name', 'Another Name')

    // Check that the event was emitted
    expect(eventHandler).toHaveBeenCalled()

    // Use the returned subscription to unregister
    form.off('field_changed', eventHandler)

    // Reset the mock
    eventHandler.mockReset()

    // Change value again
    await form.setFieldValue('name', 'Yet Another Name')

    // Check that the event was not emitted
    expect(eventHandler).not.toHaveBeenCalled()
  })

  it('emits events through Vue component emit system', async () => {
    // Get the form state from the slot
    const formRef = wrapper.vm.form

    // Change a field value
    await formRef.setFieldValue('name', 'New Name')

    // Check that the Vue event was emitted
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('field_changed')).toBeTruthy()

    // Focus and blur fields
    formRef.setFieldFocused('email')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('field_focus')).toBeTruthy()

    formRef.setFieldBlurred('email')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('field_blur')).toBeTruthy()
  })

  it('emits form-initialized event', async () => {
    // Because the form is already initialized in beforeEach,
    // we need to create a new form here
    const initHandler = vi.fn()

    // Mount a new wrapper with component-level event listener
    const newWrapper = mount(Enforma, {
      props: {
        data: { test: 'value' },
        submitHandler: vi.fn(),
      },
    })

    // Register event handler
    newWrapper.vm.form.on('form_initialized', initHandler)

    // Wait for the setTimeout in the form initialization
    await new Promise((resolve) => setTimeout(resolve, 10))

    // Check event was emitted
    expect(initHandler).toHaveBeenCalled()
    expect(newWrapper.emitted('form_initialized')).toBeTruthy()
  })

  it('emits form events during submission', async () => {
    // Success case
    const successHandler = vi.fn()
    wrapper.vm.form.on('submit_success', successHandler)

    submitHandler.mockResolvedValueOnce({})

    // Submit the form
    await wrapper.vm.form.submit()
    await flushPromises()

    // Check success event
    expect(successHandler).toHaveBeenCalled()
    expect(wrapper.emitted('submit_success')).toBeTruthy()

    // Error case
    const errorHandler = vi.fn()
    wrapper.vm.form.on('submit_error', errorHandler)

    const error = new Error('Submission failed')
    submitHandler.mockRejectedValueOnce(error)

    // Submit the form again
    await wrapper.vm.form.submit()
    await flushPromises()

    // Check error event
    expect(errorHandler).toHaveBeenCalled()
    expect(wrapper.emitted('submit_error')).toBeTruthy()
  })
})
