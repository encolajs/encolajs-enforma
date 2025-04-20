import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useForm } from '@/headless/useForm'
import { flushPromises } from '@vue/test-utils'
import { FormController } from '../../src'

describe('useForm', () => {
  let order
  let form: FormController
  const submitHandler = vi.fn()

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
  describe('form methods', () => {
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

      const isValid = await form.submit()

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

      expect(field.$errors.value).toHaveLength(0)
      expect(field.$isDirty.value).toBe(false)
      expect(field.$isTouched.value).toBe(false)
      expect(field.$isValidating.value).toBe(false)
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

  describe('form state', () => {
    test('should track validation state', async () => {
      form['items.0.price'] = 5
      const submitPromise = form.submit()
      expect(form.$isValidating).toBe(true)
      await submitPromise
      expect(form.$isValidating).toBe(false)
    })

    test('should track submit state', async () => {
      const submitPromise = form.submit()

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

  describe('basic field operations', () => {
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
      expect(form['items.0.price.$isDirty']).toBe(true)
      expect(form['items.0.price.$errors']).toHaveLength(1)
    })

    test('should manually validate fields', async () => {
      form['items.0.price'] = 5
      const isValid = await form.validate()
      expect(isValid).toBe(false)
      expect(form['items.0.price.$errors']).toHaveLength(1)
    })
  })

  describe('missing properties', () => {
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

  describe('array operations', () => {
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

  describe('field state', () => {
    test('should track validation state', async () => {
      form.setFieldValue('items.0.price', 5)
      expect(form['items.0.price.$isValidating'].value).toBe(true)
      await flushPromises()
      expect(form['items.0.price.$isValidating'].value).toBe(false)
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

  describe('error handling', () => {
    test('should handle validation errors in validateForm', async () => {
      // Mock console.error to prevent test output pollution
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // Create a form with a validator that throws an error
      const errorForm = useForm(
        order,
        {
          'items.*.price': 'required|integer|gt:150',
        },
        {
          validatorFactory: {
            make: () =>
              ({
                validatePath: vi
                  .fn()
                  .mockRejectedValue(new Error('Validation error')),
                getErrorsForPath: vi.fn().mockReturnValue(['Error message']),
              } as any),
          } as any,
        }
      )

      errorForm.getField('items.0.price')
      // Trigger validation
      const isValid = await errorForm.validate()

      // Check that validation failed and error was logged
      expect(isValid).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating field items.0.price',
        expect.any(Error)
      )

      // Restore console.error
      consoleErrorSpy.mockRestore()
    })

    test('should pass form controller to submit handler', async () => {
      const submitHandler = vi.fn()
      const form = useForm(
        order,
        {},
        {
          submitHandler,
        }
      )

      await form.submit()

      expect(submitHandler).toHaveBeenCalledWith(
        order, // Values
        expect.any(Object) // Form controller - checking exact form is problematic due to proxy
      )
      // Verify the form controller has the expected methods
      const formController = submitHandler.mock.calls[0][1]
      expect(typeof formController.setFieldErrors).toBe('function')
      expect(typeof formController.setErrors).toBe('function')
    })

    test('should pass form controller to onSubmitError handler', async () => {
      const error = new Error('API error')
      const submitHandler = vi.fn().mockRejectedValue(error)
      const onSubmitError = vi.fn()

      const form = useForm(
        order,
        {},
        {
          submitHandler,
          onSubmitError,
        }
      )

      await form.submit()

      expect(onSubmitError).toHaveBeenCalledWith(
        error, // Error object
        expect.any(Object) // Form controller
      )

      // Verify the form controller has the expected methods
      const formController = onSubmitError.mock.calls[0][1]
      expect(typeof formController.setFieldErrors).toBe('function')
      expect(typeof formController.setErrors).toBe('function')
    })

    test('should set field errors directly using setFieldErrors', async () => {
      const form = useForm(order)

      form.setFieldErrors('items.0.price', ['Custom error message'])

      expect(form['items.0.price.$errors']).toEqual(['Custom error message'])
      expect(form['items.0.price.$isTouched']).toBe(true)
    })

    test('should set multiple field errors using setErrors', async () => {
      const form = useForm(order)

      form.setErrors({
        'items.0.price': ['Price error'],
        'items.1.quantity': ['Quantity error'],
      })

      expect(form['items.0.price.$errors']).toEqual(['Price error'])
      expect(form['items.1.quantity.$errors']).toEqual(['Quantity error'])
      expect(form['items.0.price.$isTouched']).toBe(true)
      expect(form['items.1.quantity.$isTouched']).toBe(true)
    })

    test('should handle API validation errors in submit handler', async () => {
      // Simulate an API returning validation errors
      const mockSetErrors = vi.fn()
      const submitHandler = vi.fn().mockImplementation((_, form) => {
        // Verify the form controller has setErrors method
        expect(typeof form.setErrors).toBe('function')

        // Call setErrors manually since we'll use mockSetErrors to verify
        form.setErrors({
          'items.0.price': ['Price must be at least $50'],
          'address.line1': ['Address is required'],
        })

        // Record that setErrors was called
        mockSetErrors(form)

        // Simulate throwing an error that would come from a failed API call
        throw new Error('Validation failed')
      })

      const form = useForm(
        order,
        {},
        {
          submitHandler,
        }
      )

      // Get field state reference before submit
      const priceFieldBefore = form.getField('items.0.price')
      const addressFieldBefore = form.getField('address.line1')

      const result = await form.submit()

      // Verify setErrors was called
      expect(mockSetErrors).toHaveBeenCalled()

      // Verify the validation result
      expect(result).toBe(false)

      // Verify field errors were set
      expect(priceFieldBefore.$errors.value).toContain('Price must be at least $50')
      expect(addressFieldBefore.$errors.value).toContain('Address is required')
    })

    test('should handle validation errors in validateField', async () => {
      // Mock console.error to prevent test output pollution
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // Create a form with a validator that throws an error
      const errorForm = useForm(
        order,
        {
          'items.*.price': 'required|integer|gt:10',
        },
        {
          validatorFactory: {
            make: () =>
              ({
                validatePath: vi
                  .fn()
                  .mockRejectedValue(new Error('Validation error')),
                getErrorsForPath: vi.fn().mockReturnValue(['Error message']),
              } as any),
          } as any,
        }
      )

      // Trigger field validation
      const isValid = await errorForm.validateField('items.0.price')

      // Check that validation failed and error was logged
      expect(isValid).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating field items.0.price',
        expect.any(Error)
      )

      // Restore console.error
      consoleErrorSpy.mockRestore()
    })

    test('should handle submit errors', async () => {
      // Create a form with a submit handler that throws an error
      const errorHandler = vi.fn().mockRejectedValue(new Error('Submit error'))
      const onErrorHandler = vi.fn()

      const errorForm = useForm(
        order,
        {},
        {
          submitHandler: errorHandler,
          onSubmitError: onErrorHandler,
        }
      )

      // Trigger submit
      const submitted = await errorForm.submit()

      // Check that submit failed and error handler was called
      expect(submitted).toBe(false)
      expect(errorHandler).toHaveBeenCalled()
      expect(onErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      )
    })

    test('should handle validation errors during submit', async () => {
      // Create a form with validation errors
      const onValidationError = vi.fn()

      const errorForm = useForm(
        order,
        {
          'items.*.price': 'required|integer|gt:10',
        },
        {
          onValidationError,
        }
      )

      // Set invalid values
      errorForm['items.0.price'] = 5

      // Trigger submit
      const isValid = await errorForm.submit()

      // Check that submit failed and validation error handler was called
      expect(isValid).toBe(false)
      expect(onValidationError).toHaveBeenCalled()
    })

    test('should handle path resolution errors in reset', async () => {
      // Create a form with a complex object
      const complexForm = useForm({
        nested: {
          array: [{ value: 1 }],
        },
      })

      // Add a field that will cause a path resolution error
      await complexForm.setFieldValue('nested.array.0.value', 2)

      // Modify the object structure to cause a path resolution error
      complexForm['nested'] = null

      // Reset should not throw an error
      expect(() => complexForm.reset()).not.toThrow()
    })

    test('should handle setValueByPath errors', async () => {
      // Create a form with a complex object
      const complexForm = useForm({
        nested: {
          array: [{ value: 1 }],
        },
      })

      // Set a value that should work
      await complexForm.setFieldValue('nested.array.0.value', 2)
      expect(complexForm['nested.array.0.value']).toBe(2)

      // Set a value that should cause an error in setValueByPath
      // This is a bit tricky to trigger, but we can try to set a value on a non-existent path
      // after modifying the object structure
      complexForm['nested'] = null

      // This should not throw an error
      expect(() => {
        complexForm['nested.array.0.value'] = 3
      }).not.toThrow()
    })

    test('should reset new keys to appropriate default values', async () => {
      // Create a form with initial values
      const initialData = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'LA',
        },
        tags: ['developer', 'vue'],
      }

      const form = useForm(initialData)

      // Add new keys that weren't in the initial data
      form['email'] = 'john@example.com'
      form['phone'] = '555-123-4567'
      form['address.zipCode'] = '12345'
      form['skills'] = ['JavaScript', 'TypeScript']
      form['preferences.theme'] = 'dark'

      // Verify the new keys were added
      expect(form['email']).toBe('john@example.com')
      expect(form['phone']).toBe('555-123-4567')
      expect(form['address.zipCode']).toBe('12345')
      expect(form['skills']).toEqual(['JavaScript', 'TypeScript'])
      expect(form['preferences.theme']).toBe('dark')

      // Reset the form
      form.reset()

      // Verify that new keys were reset to appropriate default values
      expect(form['email']).toBeNull() // Primitive type -> null
      expect(form['phone']).toBeNull() // Primitive type -> null
      expect(form['address.zipCode']).toBeUndefined() // Nested property in existing object -> undefined
      expect(form['skills']).toEqual([]) // Array -> empty array
      expect(form['preferences']).toEqual({}) // New object -> empty object

      // Verify original values were preserved
      expect(form['name']).toBe('John')
      expect(form['age']).toBe(30)
      expect(form['address.street']).toBe('123 Main St')
      expect(form['address.city']).toBe('LA')
      expect(form['tags']).toEqual(['developer', 'vue'])
    })
  })
})
