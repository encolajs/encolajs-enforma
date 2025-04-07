import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useForm } from '../../src/composables/useForm.js'
import { flushPromises } from '@vue/test-utils'
import { ValidatorFactory } from '@encolajs/validator'
import { FormController } from '../../src'

describe('useForm', () => {
  let order
  let form: FormController
  let submitHandler = vi.fn()

  beforeEach(() => {
    order = {
      items: [
        { price: 100, quantity: 1 },
        { price: 200, quantity: 2 },
      ],
      address: {
        line1: '123 Main St',
      },
    }

    form = useForm(
      order,
      {
        'items.*.price': 'required|integer|gt:10',
      },
      {
        submitHandler,
      }
    )
  })
  describe('Form Methods', () => {
    test('should reset form to initial values', async () => {
      // Make some changes
      form['items.0.price'] = 150
      form['items.0.price.$isTouched'] = true
      await form.setFieldValue('address.line2', 'Apt 4B')

      // Reset the form
      form.reset()

      // Check values are reset
      expect(form['items.0.price']).toBe(100)
      expect(form['items.0.price.$isTouched']).toBe(false)
      expect(form['items.0.price.$isDirty']).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(0)

      // Check added fields are removed
      expect(form['address.line2']).toBeUndefined()
    })

    test('should handle submit with validation', async () => {
      const submitHandler = vi.fn()

      // Set an invalid value
      form['items.0.price'] = 5
      expect(form['items.1.price.$isTouched']).toBe(false)

      const isValid = await form.submit(submitHandler)

      // Should not call submit handler when invalid
      expect(isValid).toBe(false)
      expect(submitHandler).not.toHaveBeenCalled()
      await flushPromises()

      // All fields should be touched after submit attempt
      expect(form['items.0.price.$isTouched']).toBe(true)
      expect(form['items.1.price.$isTouched']).toBe(true)
    })

    test('should submit when valid', async () => {
      // Set a valid value
      form['items.0.price'] = 150

      // Submit
      const isValid = await form.submit()
      await flushPromises()

      // Should call submit handler with form data
      expect(isValid).toBe(true)
      expect(submitHandler).toHaveBeenCalled()
    })

    test('should validate all fields', async () => {
      form['items.0.price'] = 5
      form['items.1.price'] = 8

      const isValid = await form.validate()

      expect(isValid).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(1)
      expect(form['items.1.price.$errors']).toHaveLength(1)
    })

    test('should get field state', () => {
      const field = form.getField('items.0.price')

      expect(field.$errors).toHaveLength(0)
      expect(field.$isDirty).toBe(false)
      expect(field.$isTouched).toBe(false)
      expect(field.$isValidating).toBe(false)
      expect(field._id).toBeDefined()
    })

    test('should remove field state', async () => {
      // Set some state
      await form.setFieldValue('items.0.price', 5)
      expect(form['items.0.price.$errors']).toHaveLength(1)

      // Remove field
      form.removeField('items.0.price')

      // Field should have fresh state
      expect(form['items.0.price.$errors']).toHaveLength(0)
      expect(form['items.0.price.$isDirty']).toBe(false)
    })
  })

  describe('Form State', () => {
    test('should track validation state', async () => {
      form['items.0.price'] = 5
      const submitPromise = form.submit(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(form.$isValidating).toBe(true)
      await submitPromise
      expect(form.$isValidating).toBe(false)
    })

    test('should track submit state', async () => {
      const submitPromise = form.submit(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(form.$isSubmitting).toBe(true)
      await submitPromise
      expect(form.$isSubmitting).toBe(false)
    })

    test('should track dirty state', async () => {
      expect(form.$isDirty).toBe(false)

      form['items.0.price'] = 150
      await flushPromises()

      expect(form.$isDirty).toBe(true)

      form.reset()
      expect(form.$isDirty).toBe(false)
    })

    test('should track touched state', () => {
      expect(form.$isTouched).toBe(false)

      form['items.0.price.$isTouched'] = true
      expect(form.$isTouched).toBe(true)

      form.reset()
      expect(form.$isTouched).toBe(false)
    })
  })

  describe('Basic Field Operations', () => {
    test('should get values from business object', () => {
      expect(form['items.0.price']).toBe(100)
      expect(form['items.1.quantity']).toBe(2)
    })

    test('should set values and validate automatically', async () => {
      form['items.0.price'] = 150
      expect(form['items.0.price']).toBe(150)
      expect(order.items[0].price).toBe(150)
      await flushPromises()
      expect(form['items.0.price.$isDirty']).toBe(true)
    })

    test('should handle invalid values', async () => {
      form['items.0.price'] = 5
      expect(form['items.0.price']).toBe(5)
      await form.validateField('items.0.price')
      expect(form['items.0.price.$errors']).toHaveLength(1)
    })

    test('should use setFieldValue for external updates', async () => {
      await form.setFieldValue('items.0.price', 150, false, { $isDirty: false })
      expect(form['items.0.price']).toBe(150)
      expect(form['items.0.price.$isDirty']).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(0)
    })

    test('should use setFieldValue with validation', async () => {
      await form.setFieldValue('items.0.price', 5)
      expect(form['items.0.price']).toBe(5)
      expect(form['items.0.price.$isDirty']).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(1)
    })

    test('should manually validate fields', async () => {
      form['items.0.price'] = 5
      const isValid = await form.validate()
      expect(isValid).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(1)
    })
  })

  describe('Missing Properties', () => {
    test('should handle missing object properties', async () => {
      await form.setFieldValue('address.line2', 'Apt 4B')
      expect(form['address.line2']).toBe('Apt 4B')
      expect(order.address.line2).toBe('Apt 4B')
    })

    test('should handle deeply nested missing properties', async () => {
      await form.setFieldValue('address.additional.notes', 'Ring twice')
      expect(form['address.additional.notes']).toBe('Ring twice')
      expect(order.address.additional.notes).toBe('Ring twice')
    })
  })

  describe('Array Operations', () => {
    test('should add items', () => {
      form.add('items', 1, { price: 300, quantity: 3 })
      expect(order.items).toHaveLength(3)
      expect(order.items[1].price).toBe(300)
      expect(order.items[2].price).toBe(200)
    })

    test('should remove items', async () => {
      await form.setFieldValue('items.0.price', 5)
      form.remove('items', 0)

      expect(order.items).toHaveLength(1)
      expect(order.items[0].price).toBe(200)
      expect(form['items.0.price.$errors']).toHaveLength(0)
    })

    test('should move items with their state', async () => {
      await form.setFieldValue('items.0.price', 5)
      await form.setFieldValue('items.1.price', 15)
      form.move('items', 0, 1)

      expect(order.items[1].price).toBe(5)
      await flushPromises()
      expect(form['items.1.price.$errors']).toHaveLength(1)
    })

    test('should sort items with their state', async () => {
      await form.setFieldValue('items.0.price', 5)

      form.sort('items', (a, b) => b.price - a.price)

      expect(order.items[0].price).toBe(200)
      expect(order.items[1].price).toBe(5)
      expect(form['items.1.price.$errors']).toHaveLength(1)
    })
  })

  describe('Field State', () => {
    test('should track validation state', async () => {
      form.setFieldValue('items.0.price', 5)
      expect(form['items.0.price.$isValidating']).toBe(true)
      await flushPromises()
      expect(form['items.0.price.$isValidating']).toBe(false)
    })

    test('should allow manual state changes', () => {
      form['items.0.price.$isTouched'] = true
      expect(form['items.0.price.$isTouched']).toBe(true)
    })

    test('should handle state changes with setFieldValue', async () => {
      await form.setFieldValue('items.0.price', 150, true, {
        $isDirty: true,
        $isTouched: true,
      })
      expect(form['items.0.price.$isDirty']).toBe(true)
      expect(form['items.0.price.$isTouched']).toBe(true)
    })
  })
})
