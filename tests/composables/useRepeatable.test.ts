import { describe, it, expect, beforeEach } from 'vitest'
import { useRepeatable } from '../../src/composables/useRepeatable'
import { useFormState } from '../../src/composables/useFormState'
import { PlainObjectDataSource } from '@encolajs/validator'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

describe('useRepeatable', () => {
  describe('initialization', () => {
    it('should initialize with empty array when no value exists', async () => {
      // Create a real form state with an empty object as data source
      const formState = useFormState({})
      
      // Create a repeatable field
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Check initial value
      expect(repeatable.value.value).toEqual([])
      expect(repeatable.value.count).toBe(0)
    })

    it('should initialize with existing array values', async () => {
      // Create form state with items already in the data source
      const formState = useFormState({ items: ['item1', 'item2'] })
      
      // Create a repeatable field
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Check initial value
      expect(repeatable.value.value).toEqual(['item1', 'item2'])
      expect(repeatable.value.count).toBe(2)
    })

    it('should respect min option', async () => {
      // Create form state with an empty data source
      const formState = useFormState({})
      
      // Create a repeatable field with min option
      const repeatable = useRepeatable('items', formState, { min: 2 })
      await nextTick()
      
      // Check that canRemove is false because of the min constraint
      expect(repeatable.value.canRemove).toBe(false)
    })

    it('should respect max option', async () => {
      // Create form state with items already in the data source
      const formState = useFormState({ items: ['item1', 'item2'] })
      
      // Create a repeatable field with max option
      const repeatable = useRepeatable('items', formState, { max: 2 })
      await nextTick()
      
      // Check that canAdd is false because of the max constraint
      expect(repeatable.value.canAdd).toBe(false)
    })
  })

  describe('add operation', () => {
    it('should add item at the end by default', async () => {
      // Setup
      const formState = useFormState({ items: ['item1'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.add('item2')
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2'])
    })

    it('should add item at specified position', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item3'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.add('item2', 1)
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2', 'item3'])
    })

    it('should not add item if max limit is reached', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', formState, { max: 2 })
      await nextTick()
      
      // Act
      const result = await repeatable.value.add('item3')
      await nextTick()
      
      // Assert
      expect(result).toBe(false)
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2'])
    })
  })

  describe('remove operation', () => {
    it('should remove item at specified index', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.remove(1)
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item3'])
    })

    it('should not remove item if min limit is reached', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', formState, { min: 2 })
      await nextTick()
      
      // Act
      const result = await repeatable.value.remove(0)
      await nextTick()
      
      // Assert
      expect(result).toBe(false)
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2'])
    })
  })

  describe('move operations', () => {
    it('should move item to new position', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.move(0, 2)
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item2', 'item3', 'item1'])
    })

    it('should move item up', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.moveUp(1)
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item2', 'item1', 'item3'])
    })

    it('should move item down', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      await repeatable.value.moveDown(1)
      await nextTick()
      
      // Assert
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item3', 'item2'])
    })

    it('should not move up first item', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      const result = await repeatable.value.moveUp(0)
      await nextTick()
      
      // Assert
      expect(result).toBe(false)
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2'])
    })

    it('should not move down last item', async () => {
      // Setup
      const formState = useFormState({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', formState)
      await nextTick()
      
      // Act
      const result = await repeatable.value.moveDown(1)
      await nextTick()
      
      // Assert
      expect(result).toBe(false)
      expect(formState.getFieldValue('items')).toEqual(['item1', 'item2'])
    })
    
    it('should preserve field state when moving items', async () => {
      // Setup form with complex objects
      const initialData = {
        contacts: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Charlie', email: 'charlie@example.com' }
        ]
      }
      
      const formState = useFormState(new PlainObjectDataSource(initialData))
      const repeatable = useRepeatable('contacts', formState)
      
      // Register fields to ensure field state exists
      formState.registerField('contacts.0.name')
      formState.registerField('contacts.0.email')
      formState.registerField('contacts.1.name')
      formState.registerField('contacts.1.email')
      formState.registerField('contacts.2.name')
      formState.registerField('contacts.2.email')
      flushPromises()
      
      // Make changes to create dirty state
      formState.setFieldValue('contacts.1.email', 'bob.updated@example.com')
      formState.touchField('contacts.1.email')
      flushPromises()

      // Move the item with the change
      await repeatable.value.move(1, 0)
      flushPromises()

      // Verify the order changed
      expect(formState.getFieldValue('contacts.0.name')).toBe('Bob')
      expect(formState.getFieldValue('contacts.0.email')).toBe('bob.updated@example.com')
      
      // Verify dirty state was preserved (now at the new location)
      const newEmailField = formState.getField('contacts.0.email')
      expect(newEmailField?.isDirty).toBe(true)
      expect(newEmailField?.isTouched).toBe(true)
    })

    // Test for moving an item with errors to a new position
    it('should preserve field errors when moving an item with validation errors', async () => {
      // Setup form with prepopulated data
      const initialData = {
        skills: [
          { name: 'JavaScript', level: 'Expert' },
          { name: 'TypeScript', level: 'Intermediate' },
          { name: '', level: 'Beginner' } // Empty name will cause validation error
        ]
      }

      // Create formState with validation rules
      const formState = useFormState(initialData, {
        'skills.*.name': 'required'
      })

      const repeatable = useRepeatable('skills', formState)
      await nextTick()

      // Register fields to ensure field state exists
      formState.registerField('skills.0.name')
      formState.registerField('skills.0.level')
      formState.registerField('skills.1.name')
      formState.registerField('skills.1.level')
      formState.registerField('skills.2.name')
      formState.registerField('skills.2.level')

      // Validate to generate error
      await formState.validate()
      await nextTick()

      // Verify the error exists on the last item
      const lastNameField = formState.getField('skills.2.name')
      expect(lastNameField?.error).not.toBeNull()
      expect(formState.errors['skills.2.name']).toBeDefined()

      // Move the last item to the first position
      await repeatable.value.move(2, 0)
      await nextTick()

      // Verify the error moved to the new position
      const newNameField = formState.getField('skills.0.name')
      expect(newNameField?.error).not.toBeNull()
      expect(formState.errors['skills.0.name']).toBeDefined()
      expect(formState.errors['skills.2.name']).toBeUndefined()
    })

// Test for preserving tentative values when moving items
    it('should preserve tentative values when moving items', async () => {
      // Setup form with prepopulated data
      const initialData = {
        contacts: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Charlie', email: 'charlie@example.com' }
        ]
      }

      const formState = useFormState(initialData)
      const repeatable = useRepeatable('contacts', formState)
      await nextTick()

      // Register fields
      formState.registerField('contacts.0.name')
      formState.registerField('contacts.0.email')
      formState.registerField('contacts.1.name')
      formState.registerField('contacts.1.email')
      formState.registerField('contacts.2.name')
      formState.registerField('contacts.2.email')

      // Modify the last item to create a tentative value
      formState.setFieldValue('contacts.2.email', 'charlie.updated@example.com')

      // Move the modified item to the first position
      await repeatable.value.move(2, 0)
      await nextTick()

      // Verify tentative value was moved to the new position
      expect(formState.getFieldValue('contacts.0.email')).toBe('charlie.updated@example.com')
      expect(formState.getFieldValue('contacts')).toEqual([
        { name: 'Charlie', email: 'charlie.updated@example.com' },
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ])
    })

// Test for correctly handling empty form initialization
    it('should handle repeatable fields with tentative values when array is empty initially', async () => {
      // Setup form with no initial data
      const formState = useFormState({ tasks: [] })
      const repeatable = useRepeatable('tasks', formState)
      await nextTick()

      // Add an item
      await repeatable.value.add({ title: '', priority: 'Medium' })
      await nextTick()

      // Set a tentative value on the new item
      formState.setFieldValue('tasks.0.title', 'First Task')

      // Add another item before the first
      await repeatable.value.add({ title: 'Inserted Task', priority: 'High' }, 0)
      await nextTick()

      // Verify the order and that tentative values are preserved
      const tasks = formState.getFieldValue('tasks')
      expect(tasks).toEqual([
        { title: 'Inserted Task', priority: 'High' },
        { title: 'First Task', priority: 'Medium' }
      ])
    })

// Test for moving an item from last to first position in a longer array
    it('should correctly move an item from last to first position in a long array', async () => {
      // Setup form with multiple items
      const initialData = {
        items: Array(5).fill(null).map((_, i) => ({ name: `Item ${i+1}`, id: i+1 }))
      }

      const formState = useFormState(initialData)
      const repeatable = useRepeatable('items', formState)
      await nextTick()

      // Register fields
      for (let i = 0; i < 5; i++) {
        formState.registerField(`items.${i}.name`)
        formState.registerField(`items.${i}.id`)
      }

      // Add validation error to last item
      formState.setFieldValue('items.4.name', '') // Make it invalid
      formState.registerField('items.4.name') // Re-register to ensure field state exists

      // Add validation rule
      const validator = formState['validator']
      validator.setRules({ 'items.*.name': 'required' })

      // Validate to generate error
      await formState.validate()
      await nextTick()

      // Move last item to first position
      await repeatable.value.move(4, 0)
      await nextTick()

      // Verify the order
      const items = formState.getFieldValue('items')
      expect(items[0].id).toBe(5) // Last item is now first

      // Verify error was moved
      expect(formState.errors['items.0.name']).toBeDefined()
      expect(formState.errors['items.4.name']).toBeUndefined()
    })

// Test for removing an item with errors
    it('should properly handle errors when removing an item with validation errors', async () => {
      // Setup form with prepopulated data
      const initialData = {
        users: [
          { username: 'user1', role: 'admin' },
          { username: '', role: 'editor' }, // Invalid
          { username: 'user3', role: 'viewer' }
        ]
      }

      const formState = useFormState(initialData, {
        'users.*.username': 'required'
      })

      const repeatable = useRepeatable('users', formState)
      await nextTick()

      // Register fields
      for (let i = 0; i < 3; i++) {
        formState.registerField(`users.${i}.username`)
        formState.registerField(`users.${i}.role`)
      }

      // Validate to generate error
      await formState.validate()
      await nextTick()

      // Verify middle item has error
      expect(formState.errors['users.1.username']).toBeDefined()

      // Remove the item with error
      await repeatable.value.remove(1)
      await nextTick()

      // Verify the array updated correctly
      const users = formState.getFieldValue('users')
      expect(users.length).toBe(2)
      expect(users[0].username).toBe('user1')
      expect(users[1].username).toBe('user3')

      // Verify error was removed
      expect(formState.errors['users.1.username']).toBeUndefined()
    })

// Test for adding an item with the same field name that has errors elsewhere
    it('should not duplicate errors when adding an item with a field name that has errors elsewhere', async () => {
      // Setup form with prepopulated data
      const initialData = {
        products: [
          { code: 'A001', name: 'Product 1' },
          { code: '', name: 'Product 2' } // Invalid
        ]
      }

      const formState = useFormState(initialData, {
        'products.*.code': 'required'
      })

      const repeatable = useRepeatable('products', formState)
      await nextTick()

      // Register fields
      formState.registerField('products.0.code')
      formState.registerField('products.0.name')
      formState.registerField('products.1.code')
      formState.registerField('products.1.name')

      // Validate to generate error
      await formState.validate()
      await nextTick()

      // Verify second item has error
      expect(formState.errors['products.1.code']).toBeDefined()

      // Add a new item at the beginning
      await repeatable.value.add({ code: 'A000', name: 'New Product' }, 0)
      await nextTick()

      // Verify the array updated correctly
      const products = formState.getFieldValue('products')
      expect(products.length).toBe(3)

      // Error should still be on the original item, now at index 2
      expect(formState.errors['products.2.code']).toBeDefined()
      expect(formState.errors['products.1.code']).toBeUndefined()
    })

// Test for field state consistency after multiple operations
    it('should maintain field state consistency after multiple move operations', async () => {
      // Setup form with prepopulated data
      const initialData = {
        todos: [
          { title: 'Task 1', completed: false },
          { title: 'Task 2', completed: true },
          { title: 'Task 3', completed: false },
          { title: 'Task 4', completed: true }
        ]
      }

      const formState = useFormState(initialData)
      const repeatable = useRepeatable('todos', formState)
      await nextTick()

      // Register fields
      for (let i = 0; i < 4; i++) {
        formState.registerField(`todos.${i}.title`)
        formState.registerField(`todos.${i}.completed`)
      }

      // Make changes to create dirty state
      formState.setFieldValue('todos.0.title', 'Updated Task 1')
      formState.touchField('todos.0.title')

      formState.setFieldValue('todos.3.title', 'Updated Task 4')
      formState.touchField('todos.3.title')

      // Perform multiple operations
      await repeatable.value.move(0, 2) // First to third position
      await nextTick()

      await repeatable.value.move(3, 1) // Last to second position
      await nextTick()

      // Verify the final order
      const todos = formState.getFieldValue('todos')
      expect(todos[2].title).toBe('Updated Task 1') // First item now third
      expect(todos[1].title).toBe('Updated Task 4') // Last item now second

      // Verify dirty state was preserved
      const thirdTitleField = formState.getField('todos.2.title')
      expect(thirdTitleField?.isDirty).toBe(true)
      expect(thirdTitleField?.isTouched).toBe(true)

      const secondTitleField = formState.getField('todos.1.title')
      expect(secondTitleField?.isDirty).toBe(true)
      expect(secondTitleField?.isTouched).toBe(true)
    })

// Test for error message preservation when swapping items
    it('should preserve error messages when swapping adjacent items', async () => {
      // Setup form with prepopulated data
      const initialData = {
        accounts: [
          { email: '', password: 'password123' }, // Invalid email
          { email: 'valid@example.com', password: 'password456' }
        ]
      }

      const formState = useFormState(initialData, {
        'accounts.*.email': 'required|email'
      })

      const repeatable = useRepeatable('accounts', formState)
      await nextTick()

      // Register fields
      formState.registerField('accounts.0.email')
      formState.registerField('accounts.0.password')
      formState.registerField('accounts.1.email')
      formState.registerField('accounts.1.password')

      // Validate to generate error
      await formState.validate()
      await nextTick()

      // Verify first item has error
      expect(formState.errors['accounts.0.email']).toBeDefined()

      // Swap the two items
      await repeatable.value.move(0, 1)
      await nextTick()

      // Verify error moved with the item
      expect(formState.errors['accounts.1.email']).toBeDefined()
      expect(formState.errors['accounts.0.email']).toBeUndefined()
    })
  })


})