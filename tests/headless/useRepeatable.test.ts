import { describe, it, expect, beforeEach } from 'vitest'
import { useRepeatable } from '@/headless/useRepeatable'
import { useForm } from '@/headless/useForm'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

describe('useRepeatable', () => {
  describe('initialization', () => {
    it('should initialize with empty array when no value exists', async () => {
      const form = useForm({})
      const repeatable = useRepeatable('items', form)
      await nextTick()

      expect(repeatable.value.value).toEqual([])
      expect(repeatable.value.count).toBe(0)
    })

    it('should initialize with existing array values', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      expect(repeatable.value.value).toEqual(['item1', 'item2'])
      expect(repeatable.value.count).toBe(2)
    })

    it('should respect min option', async () => {
      const form = useForm({})
      const repeatable = useRepeatable('items', form, { min: 2 })
      await nextTick()

      expect(repeatable.value.canRemove).toBe(false)
    })

    it('should respect max option', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form, { max: 2 })
      await nextTick()

      expect(repeatable.value.canAdd).toBe(false)
    })
  })

  describe('add operation', () => {
    it('should add item at the end by default', async () => {
      const form = useForm({ items: ['item1'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.add('item2')
      await nextTick()

      expect(form.items).toEqual(['item1', 'item2'])
    })

    it('should add item at specified position', async () => {
      const form = useForm({ items: ['item1', 'item3'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.add('item2', 1)
      await nextTick()

      expect(form.items).toEqual(['item1', 'item2', 'item3'])
    })

    it('should not add item if max limit is reached', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form, { max: 2 })
      await nextTick()

      const result = await repeatable.value.add('item3')
      await nextTick()

      expect(result).toBe(false)
      expect(form.items).toEqual(['item1', 'item2'])
    })
  })

  describe('remove operation', () => {
    it('should remove item at specified index', async () => {
      const form = useForm({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.remove(1)
      await nextTick()

      expect(form.items).toEqual(['item1', 'item3'])
    })

    it('should not remove item if min limit is reached', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form, { min: 2 })
      await nextTick()

      const result = await repeatable.value.remove(0)
      await nextTick()

      expect(result).toBe(false)
      expect(form.items).toEqual(['item1', 'item2'])
    })
  })

  describe('move operations', () => {
    it('should move item to new position', async () => {
      const form = useForm({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.move(0, 2)
      await nextTick()

      expect(form.items).toEqual(['item2', 'item3', 'item1'])
    })

    it('should move item up', async () => {
      const form = useForm({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.moveUp(1)
      await nextTick()

      expect(form.items).toEqual(['item2', 'item1', 'item3'])
    })

    it('should move item down', async () => {
      const form = useForm({ items: ['item1', 'item2', 'item3'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      await repeatable.value.moveDown(1)
      await nextTick()

      expect(form.items).toEqual(['item1', 'item3', 'item2'])
    })

    it('should not move up first item', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      const result = await repeatable.value.moveUp(0)
      await nextTick()

      expect(result).toBe(false)
      expect(form.items).toEqual(['item1', 'item2'])
    })

    it('should not move down last item', async () => {
      const form = useForm({ items: ['item1', 'item2'] })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      const result = await repeatable.value.moveDown(1)
      await nextTick()

      expect(result).toBe(false)
      expect(form.items).toEqual(['item1', 'item2'])
    })
  })

  describe('field state preservation', () => {
    it('should preserve field state when moving items', async () => {
      const form = useForm({
        contacts: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Charlie', email: 'charlie@example.com' },
        ],
      })
      const repeatable = useRepeatable('contacts', form)
      await nextTick()

      // Modify field state
      form['contacts.1.email'] = 'bob.updated@example.com'
      form['contacts.1.email.$isTouched'] = true
      await flushPromises()

      // Move item
      await repeatable.value.move(1, 0)
      await flushPromises()

      // Check field state preservation
      expect(form['contacts.0.name']).toBe('Bob')
      expect(form['contacts.0.email']).toBe('bob.updated@example.com')
      expect(form['contacts.0.email.$isTouched']).toBe(true)
    })

    it('should preserve validation state when moving items', async () => {
      const form = useForm(
        {
          skills: [
            { name: 'JavaScript', level: 'Expert' },
            { name: null, level: 'Intermediate' }, // Invalid
            { name: 'Python', level: 'Beginner' },
          ],
        },
        {
          'skills.*.name': 'required',
        }
      )

      const repeatable = useRepeatable('skills', form)
      await nextTick()

      expect(form['skills.0.name']).toBe('JavaScript')
      expect(form['skills.1.name']).toBe(null)

      // Validate to generate error
      await form.validate()
      await flushPromises()

      expect(form['skills.0.name.$errors'].length).toBe(0)
      expect(form['skills.1.name.$errors'].length).toBe(1)

      // Move item with error
      await repeatable.value.move(1, 0)
      await flushPromises()

      // Check error state moved with item
      expect(form['skills.0.name.$errors']).toBeTruthy()
      expect(form['skills.0.name.$errors'].length).toBeGreaterThan(0)
    })
  })

  describe('validation', () => {
    it('should validate array when validateOnAdd is true', async () => {
      const form = useForm(
        { items: ['item1'] },
        {
          items: 'array_min:1',
        }
      )

      const repeatable = useRepeatable('items', form, { validateOnAdd: true })
      await nextTick()

      await repeatable.value.add('item2')
      await flushPromises()

      expect(form['items.$errors']).toHaveLength(0)
    })

    it('should validate array when validateOnRemove is true', async () => {
      const form = useForm(
        { items: ['item1', 'item2'] },
        {
          items: 'array_min:1',
        }
      )

      const repeatable = useRepeatable('items', form, {
        validateOnRemove: true,
      })
      await nextTick()

      await repeatable.value.remove(0)
      await flushPromises()

      expect(form['items.$errors']).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle non-array initial values', async () => {
      const form = useForm({ items: 'not-an-array' })
      const repeatable = useRepeatable('items', form)
      await nextTick()

      expect(repeatable.value.value).toEqual(['not-an-array'])
    })

    it('should handle undefined initial values', async () => {
      const form = useForm({})
      const repeatable = useRepeatable('items', form)
      await nextTick()

      expect(repeatable.value.value).toEqual([])
    })

    it('should use defaultValue when adding items', async () => {
      const form = useForm({ items: [] })
      const repeatable = useRepeatable('items', form, {
        defaultValue: { name: '', status: 'new' },
      })
      await nextTick()

      await repeatable.value.add()
      await nextTick()

      expect(form.items[0]).toEqual({ name: '', status: 'new' })
    })
  })
})
