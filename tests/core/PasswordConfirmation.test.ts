import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import { setGlobalConfig, getGlobalConfig } from '@/utils/useConfig'
import useDefaultPreset from '../../src/presets/default'

describe('Password Confirmation Validation', () => {
  // Handler that will be spied on
  const submitHandler = vi.fn()

  // Set up validation schema
  const schema = {
    password: {
      label: 'Password',
      type: 'field',
      inputProps: { type: 'password' }
    },
    password_confirmation: {
      label: 'Confirm Password',
      type: 'field',
      inputProps: { type: 'password' }
    }
  }

  // Set up validation rules
  const rules = {
    password: 'required',
    password_confirmation: 'required|same_as:@password'
  }

  const customMessages = {
    'password_confirmation:same_as': 'Passwords must match'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    submitHandler.mockReset()

    useDefaultPreset()
    // Setup global config
    const currentConfig = getGlobalConfig()
    setGlobalConfig({
      ...currentConfig,
      components: {
        ...currentConfig.components,
      },
      pt: {
        label: { class: 'enforma-label' },
        input: { class: 'enforma-input' },
        error: { class: 'enforma-field-error' },
        help: { class: 'enforma-help' },
        wrapper: { class: 'enforma-wrapper' }
      }
    })
  })

  it('shows error when password_confirmation does not match password', async () => {
    // Mount Enforma component
    const wrapper = mount(Enforma, {
      props: {
        data: { password: '', password_confirmation: '' },
        schema,
        rules,
        customMessages,
        submitHandler
      },
    })

    await flushPromises()

    // Find form inputs
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    
    // Set password value
    await inputs[0].setValue('secure123')
    await inputs[0].trigger('change')
    await inputs[0].trigger('blur')
    await flushPromises()
    
    // Set different confirmation value
    await inputs[1].setValue('different123')
    await inputs[1].trigger('change')
    await inputs[1].trigger('blur')
    await flushPromises()

    vi.runAllTimers()

    await flushPromises()
    
    // Check for error message
    const errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(true)
    
    // Verify submit handler was not called due to validation error
    expect(submitHandler).not.toHaveBeenCalled()
  })

  it('clears error when password is changed to match confirmation', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { password: '', password_confirmation: '' },
        schema,
        rules,
        submitHandler
      },
    })

    await flushPromises()
    
    // Find inputs
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    
    // Set initial password value
    await inputs[0].setValue('secure123')
    await inputs[0].trigger('change')
    await inputs[0].trigger('blur')
    await flushPromises()
    
    // Set different confirmation value
    await inputs[1].setValue('different123')
    await inputs[1].trigger('change')
    await inputs[1].trigger('blur')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()

    // Check that error appears
    let errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(true)
    
    // Now change password to match confirmation
    await inputs[0].setValue('different123')
    await inputs[0].trigger('change')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()

    // Error should be gone
    errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(false)
  })

  it('clears error when confirmation is changed to match password', async () => {
    const wrapper = mount(Enforma, {
      props: {
        data: { password: '', password_confirmation: '' },
        schema,
        rules,
        submitHandler
      },
    })

    await flushPromises()
    
    // Find inputs
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    
    // Set initial values with mismatch
    await inputs[0].setValue('secure123')
    await inputs[0].trigger('change')
    await flushPromises()
    
    await inputs[1].setValue('different123')
    await inputs[1].trigger('change')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()
    
    // Check that error appears
    let errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(true)
    
    // Now change confirmation to match password
    await inputs[1].setValue('secure123')
    await inputs[1].trigger('change')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()
    
    // Error should be gone
    errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(false)
  })

  it('validates fields immediately when related field changes', async () => {
    // Configure validation to happen on input
    const currentConfig = getGlobalConfig()
    setGlobalConfig({
      ...currentConfig
    })

    const wrapper = mount(Enforma, {
      props: {
        data: { password: '', password_confirmation: '' },
        schema,
        rules,
        submitHandler
      },
    })

    await flushPromises()
    
    // Find inputs
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    
    // Set initial values with mismatch
    await inputs[0].setValue('secure123')
    await inputs[0].trigger('input')
    await inputs[0].trigger('blur')
    await flushPromises()
    
    await inputs[1].setValue('different123')
    await inputs[1].trigger('input')
    await inputs[1].trigger('blur')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()

    // Check that error exists
    let errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(true)
    
    // Change password to match confirmation - with input validation, this should update immediately
    await inputs[0].setValue('different123')
    await inputs[0].trigger('input')
    await flushPromises()

    vi.runAllTimers()
    await flushPromises()

    // Error should now be gone
    errorElement = wrapper.find('.enforma-field-error')
    expect(errorElement.exists()).toBe(false)
  })
})