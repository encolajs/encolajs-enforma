import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useRepeatable } from '../../src/composables/useRepeatable'
import type { FormStateReturn } from '../../src'

const createMockFormState = (): FormStateReturn => {
  const errors: Record<string, string[]> = {}

  return {
    fields: new Map(),
    pathToId: new Map(),
    isSubmitting: ref(false),
    isValidating: ref(false),
    validationCount: ref(0),
    submitted: ref(false),
    errors,
    isDirty: computed(() => false),
    isTouched: computed(() => false),
    isValid: computed(() => true),
    registerField: vi.fn(),
    unregisterField: vi.fn(),
    touchField: vi.fn(),
    getField: vi.fn(),
    validate: vi.fn().mockResolvedValue(true),
    validateField: vi.fn().mockResolvedValue(true),
    reset: vi.fn(),
    submit: vi.fn().mockResolvedValue(true),
    setFieldValue: vi.fn(),
    getFieldValue: vi.fn().mockReturnValue([]),
    getData: vi.fn(),
    setData: vi.fn(),
  }
}

describe('useRepeatable', () => {
  let formState: FormStateReturn

  beforeEach(() => {
    formState = createMockFormState()
  })

  describe('initialization', () => {
    it('should initialize with empty array when no value exists', () => {
      const repeatable = useRepeatable('test', formState)
      expect(repeatable.value.value).toEqual([])
      expect(repeatable.value.count).toBe(0)
    })

    it('should initialize with existing array values', () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState)
      expect(repeatable.value.value).toEqual(['item1', 'item2'])
      expect(repeatable.value.count).toBe(2)
    })

    it('should respect min option', () => {
      const repeatable = useRepeatable('test', formState, { min: 2 })
      expect(repeatable.value.canRemove).toBe(false)
    })

    it('should respect max option', () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState, { max: 2 })
      expect(repeatable.value.canAdd).toBe(false)
    })
  })

  describe('add operation', () => {
    it('should add item at the end by default', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1'])
      const repeatable = useRepeatable('test', formState)

      await repeatable.value.add('item2')

      expect(formState.setFieldValue).toHaveBeenCalledWith(
        'test',
        ['item1', 'item2'],
        'blur'
      )
    })

    it('should add item at specified position', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState)

      await repeatable.value.add('new_item', 1)

      expect(formState.setFieldValue).toHaveBeenCalledWith(
        'test',
        ['item1', 'new_item', 'item2'],
        'blur'
      )
    })

    it('should validate new item if validateOnAdd is true', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1'])
      const repeatable = useRepeatable('test', formState, {
        validateOnAdd: true,
      })

      await repeatable.value.add({ a: null })

      expect(formState.validateField).toHaveBeenCalledWith('test', false)
    })

    it('should not add item if max limit is reached', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState, {
        max: 2,
      })

      const result = await repeatable.value.add()

      expect(result).toBe(false)
      expect(formState.setFieldValue).not.toHaveBeenCalled()
    })
  })

  describe('remove operation', () => {
    it('should remove item at specified index', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState).value

      await repeatable.remove(1)

      expect(formState.setFieldValue).toHaveBeenCalledWith(
        'test',
        ['item1', 'item3'],
        'blur'
      )
    })

    it('should not remove item if min limit is reached', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState, { min: 2 }).value

      const result = await repeatable.remove(0)

      expect(result).toBe(false)
      expect(formState.setFieldValue).not.toHaveBeenCalled()
    })

    it('should validate remaining items if validateOnRemove is true', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState, {
        validateOnRemove: true,
      }).value

      await repeatable.remove(1)

      // Should validate items after the removed index
      expect(formState.validateField).toHaveBeenCalledWith('test', false)
    })
  })

  describe('move operations', () => {
    it('should move item to new position', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState).value

      await repeatable.move(0, 2)

      expect(formState.setFieldValue).toHaveBeenCalledWith('test', [
        'item2',
        'item3',
        'item1',
      ])
    })

    it('should validate affected fields after move', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState).value

      await repeatable.move(0, 2)

      // Should validate all items in the affected range
      expect(formState.validateField).toHaveBeenCalledWith('test', false)
    })

    it('should move item up', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState).value

      await repeatable.moveUp(1)

      expect(formState.setFieldValue).toHaveBeenCalledWith('test', [
        'item2',
        'item1',
        'item3',
      ])
    })

    it('should move item down', async () => {
      formState.getFieldValue = vi
        .fn()
        .mockReturnValue(['item1', 'item2', 'item3'])
      const repeatable = useRepeatable('test', formState).value

      await repeatable.moveDown(1)

      expect(formState.setFieldValue).toHaveBeenCalledWith('test', [
        'item1',
        'item3',
        'item2',
      ])
    })

    it('should not move up first item', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState).value

      const result = await repeatable.moveUp(0)

      expect(result).toBe(false)
      expect(formState.setFieldValue).not.toHaveBeenCalled()
    })

    it('should not move down last item', async () => {
      formState.getFieldValue = vi.fn().mockReturnValue(['item1', 'item2'])
      const repeatable = useRepeatable('test', formState).value

      const result = await repeatable.moveDown(1)

      expect(result).toBe(false)
      expect(formState.setFieldValue).not.toHaveBeenCalled()
    })
  })
})
