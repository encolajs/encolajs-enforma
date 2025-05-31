import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useForm } from '@/headless/useForm'
import { FormController } from '@/types'
import { flushPromises } from '@vue/test-utils'

describe('useForm events', () => {
  let form: FormController
  let data: any

  beforeEach(() => {
    data = {
      name: 'John',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
      },
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    }

    form = useForm(data)
  })

  test('should have event handler methods', () => {
    expect(typeof form.on).toBe('function')
    expect(typeof form.off).toBe('function')
    expect(typeof form.emit).toBe('function')
  })

  test('should emit field_changed event when field value changes', async () => {
    const handler = vi.fn()
    form.on('field_changed', handler)

    await form.setFieldValue('name', 'Jane')

    expect(handler).toHaveBeenCalledWith({
      path: 'name',
      value: 'Jane',
      fieldController: form.getField('name'),
      formController: form,
    })
  })

  test('should emit form_reset event when form is reset', () => {
    const handler = vi.fn()
    form.on('form_reset', handler)

    // Change a value first
    form['name'] = 'Jane'
    form.reset()

    expect(handler).toHaveBeenCalled()
    const eventData = handler.mock.calls[0][0]
    expect(eventData.formController).toBeDefined()
    expect(eventData.formController.values).toBeDefined()
  })

  test('should emit submit_success event on successful submission', async () => {
    const submitHandler = vi.fn().mockResolvedValue(undefined)
    const handler = vi.fn()

    const form = useForm(
      data,
      {},
      {
        submitHandler,
      }
    )

    form.on('submit_success', handler)

    await form.submit()

    expect(handler).toHaveBeenCalled()
    const eventData = handler.mock.calls[0][0]
    expect(eventData.formController).toBeDefined()
  })

  test('should emit submit_error event on failed submission', async () => {
    const error = new Error('Failed to submit')
    const submitHandler = vi.fn().mockRejectedValue(error)
    const handler = vi.fn()

    const form = useForm(
      data,
      {},
      {
        submitHandler,
      }
    )

    form.on('submit_error', handler)

    await form.submit()

    expect(handler).toHaveBeenCalled()
    const eventData = handler.mock.calls[0][0]
    expect(eventData.error).toBe(error)
    expect(eventData.formController).toBeDefined()
  })

  test('should emit validation_fail event when validation fails', async () => {
    const handler = vi.fn()

    const form = useForm(data, {
      email: 'required|email',
    })

    form.on('validation_fail', handler)

    // Set an invalid email
    form['email'] = 'not-an-email'

    // Try to submit the form
    await form.submit()

    expect(handler).toHaveBeenCalled()
    const eventData = handler.mock.calls[0][0]
    expect(eventData.formController).toBeDefined()
  })

  test('should emit field_focused and field_blurred events', () => {
    const focusHandler = vi.fn()
    const blurHandler = vi.fn()

    form.on('field_focused', focusHandler)
    form.on('field_blurred', blurHandler)

    // Simulate focus and blur
    form.setFieldFocused('name')
    form.setFieldBlurred('name')

    expect(focusHandler).toHaveBeenCalled()
    expect(blurHandler).toHaveBeenCalled()

    const focusEventData = focusHandler.mock.calls[0][0]
    expect(focusEventData.path).toBe('name')
    expect(focusEventData.fieldController).toBeDefined()
    expect(focusEventData.formController).toBeDefined()

    const blurEventData = blurHandler.mock.calls[0][0]
    expect(blurEventData.path).toBe('name')
    expect(blurEventData.fieldController).toBeDefined()
    expect(blurEventData.formController).toBeDefined()
  })

  test('should emit form_initialized event', async () => {
    const handler = vi.fn()

    // We need to create the form with the event handler already set up
    // Since the initialized event is triggered in a setTimeout
    const globalHandler = vi.fn()

    // Use the global event emitter
    const form = useForm(
      data,
      {},
      {
        useGlobalEvents: true,
      }
    )

    form.on('form_initialized', handler)

    // Wait for the setTimeout to execute
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(handler).toHaveBeenCalled()
    const eventData = handler.mock.calls[0][0]
    expect(eventData.formController).toBeDefined()
  })
})
