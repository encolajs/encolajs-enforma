import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h } from 'vue'
import HeadlessRepeatable from '@/headless/HeadlessRepeatable'
import { useForm } from '@/headless/useForm'
import { useValidation } from '@/utils/useValidation'
import { formControllerKey } from '@/constants/symbols'
import { RepeatableController } from '@/headless/useRepeatable'

describe('HeadlessRepeatable', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Create real form state with validation
  const createFormState = (initialData = {}, rules = {}) => {
    const validation = useValidation()
    const formState = useForm(initialData, rules, {
      validatorFactory: validation.factory,
    })
    return formState
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('mounts with required props and form context', () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('errors when mounted without form context', () => {
      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
      })

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('must be used within an EncolaForm')
      )
    })

    it('passes repeatable state to default slot', () => {
      const formState = createFormState()
      let slotProps: RepeatableController

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (props) => {
            slotProps = props
            return h('div')
          },
        },
      })

      expect(slotProps).toMatchObject({
        value: expect.any(Array),
        canAdd: expect.any(Boolean),
        canRemove: expect.any(Boolean),
        add: expect.any(Function),
        remove: expect.any(Function),
        move: expect.any(Function),
        moveUp: expect.any(Function),
        moveDown: expect.any(Function),
        count: expect.any(Number),
      })
    })
  })

  describe('array manipulation', () => {
    it('adds items respecting max limit', async () => {
      const formState = createFormState({ items: ['item1'] })
      let slotData: any

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          max: 2,
          defaultValue: 'new_item',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Can add one more item
      expect(slotData.canAdd).toBe(true)

      // Mock the add method since we're testing component behavior
      const addSpy = vi.spyOn(formState, 'add')

      await slotData.add('item2')

      // Verify add was called with correct parameters
      expect(addSpy).toHaveBeenCalledWith('items', 1, 'item2')

      // Set up test to verify canAdd becomes false
      formState.items = ['item1', 'item2']
      await flushPromises()

      // Cannot add more items after reaching max
      expect(slotData.canAdd).toBe(false)
    })

    it('removes items respecting min limit', async () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          min: 1,
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Can remove one item
      expect(slotData.canRemove).toBe(true)

      // Mock the remove method
      const removeSpy = vi.spyOn(formState, 'remove')

      await slotData.remove(0)

      // Verify remove was called with correct parameters
      expect(removeSpy).toHaveBeenCalledWith('items', 0)

      // Setup test to verify canRemove becomes false
      formState.items = ['item2']
      await flushPromises()

      // Cannot remove more items after reaching min
      expect(slotData.canRemove).toBe(false)
    })

    it('moves items within array', async () => {
      const formState = createFormState({ items: ['item1', 'item2', 'item3'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Mock the move method
      const moveSpy = vi.spyOn(formState, 'move')

      await slotData.move(0, 2)

      // Verify move was called with correct parameters
      expect(moveSpy).toHaveBeenCalledWith('items', 0, 2)
    })
  })

  describe('validation', () => {
    it('validates the array when validateOnAdd is true', async () => {
      const formState = createFormState({ items: ['item1'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          validateOnAdd: true,
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Mock the validateField method
      const validateSpy = vi.spyOn(formState, 'validateField')

      await slotData.add('newItem')

      // Verify validateField was called with correct parameters
      expect(validateSpy).toHaveBeenCalledWith('items')
    })

    it('validates the array when validateOnRemove is true', async () => {
      const formState = createFormState({ items: ['item1', 'item2', 'item3'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          validateOnRemove: true,
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Mock the validateField method
      const validateSpy = vi.spyOn(formState, 'validateField')

      await slotData.remove(1)

      // Verify validateField was called with correct parameters
      expect(validateSpy).toHaveBeenCalledWith('items')
    })
  })

  describe('field tracking', () => {
    it('tracks fields for array items', async () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      let slotData

      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Verify items are available in slot data
      expect(slotData.value).toEqual(['item1', 'item2'])
    })
  })

  describe('edge cases', () => {
    it('handles non-array initial values', async () => {
      const formState = createFormState({ items: 'not-an-array' })
      let slotData

      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive updates
      await flushPromises()

      // We expect repeatable to convert the single value to an array
      expect(slotData.value).toEqual(['not-an-array'])
    })

    it('handles undefined initial values', async () => {
      const formState = createFormState({})
      let slotData

      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive updates
      await flushPromises()

      expect(slotData.value).toEqual([])
    })

    it('prevents invalid move operations', async () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Mock the setFieldValue method
      const moveSpy = vi.spyOn(formState, 'move')

      // Cannot move up first item
      await slotData.moveUp(0)
      expect(moveSpy).not.toHaveBeenCalled()

      // Cannot move down last item
      await slotData.moveDown(1)
      expect(moveSpy).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('unregisters fields on cleanup', async () => {
      const formState = createFormState({ items: ['item1', 'item2'] })

      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
      })

      // Wait for reactive initialization
      await flushPromises()

      // Mock the removeField method
      const unregisterSpy = vi.spyOn(formState, 'removeField')

      wrapper.unmount()
      expect(unregisterSpy).toHaveBeenCalled()
    })
  })

  describe('error message positioning', () => {
    it('correctly preserve error messages after removing last element', async () => {
      const formState = createFormState(
        {
          items: [
            { name: 'Item 1', description: 'Description 1' },
            { name: 'Item 2', description: 'Description 2' },
            { name: 'Item 3', description: '' },
          ],
        },
        {
          'items.*.name': 'required',
          'items.*.description': 'required',
        }
      )
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Validate individual fields because fields are not registered
      // And formState.validate() only works on registered fields
      await formState.validateField('items.0.description')
      await formState.validateField('items.1.description')
      await formState.validateField('items.2.description')
      await flushPromises()

      // Verify initial validation state
      expect(formState['items.0.description.$errors'].value.length).toBe(0)
      expect(formState['items.1.description.$errors'].value.length).toBe(0)
      expect(formState['items.2.description.$errors'].value.length).toBe(1)

      // Remove the last element (which is invalid)
      await slotData.remove(2)
      await flushPromises()

      // Verify validation state after removal
      expect(formState['items.0.description.$errors'].value.length).toBe(0)
      expect(formState['items.1.description.$errors'].value.length).toBe(0)
    })

    it('correctly preserve error messages after removing middle element', async () => {
      const formState = createFormState(
        {
          items: [
            { name: 'Item 1', description: 'Description 1' },
            { name: 'Item 2', description: '' },
            { name: 'Item 3', description: 'Description 3' },
          ],
        },
        {
          'items.*.name': 'required',
          'items.*.description': 'required',
        }
      )
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Validate individual fields because fields are not registered
      // And formState.validate() only works on registered fields
      await formState.validateField('items.0.description')
      await formState.validateField('items.1.description')
      await formState.validateField('items.2.description')
      await flushPromises()

      // Verify initial validation state
      expect(formState['items.0.description.$errors'].value.length).toBe(0)
      expect(formState['items.1.description.$errors'].value.length).toBe(1)
      expect(formState['items.2.description.$errors'].value.length).toBe(0)

      // Remove the middle element (which is invalid)
      await slotData.remove(1)
      await flushPromises()

      // Verify validation state after removal
      expect(formState['items.0.description.$errors'].value.length).toBe(0)
      expect(formState['items.1.description.$errors'].value.length).toBe(0)
    })

    it('correctly preserve error messages after removing first element', async () => {
      const formState = createFormState(
        {
          items: [
            { name: 'Item 1', description: '' },
            { name: 'Item 2', description: 'Description 2' },
            { name: 'Item 3', description: 'Description 3' },
          ],
        },
        {
          'items.*.name': 'required',
          'items.*.description': 'required',
        }
      )
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formControllerKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Validate individual fields because fields are not registered
      // And formState.validate() only works on registered fields
      await formState.validateField('items.0.description')
      await formState.validateField('items.1.description')
      await formState.validateField('items.2.description')
      await flushPromises()

      // Verify initial validation state
      expect(formState['items.0.description.$errors'].value.length).toBe(1)
      expect(formState['items.1.description.$errors'].value.length).toBe(0)
      expect(formState['items.2.description.$errors'].value.length).toBe(0)

      // Remove the first element (which is invalid)
      await slotData.remove(0)
      await flushPromises()

      // Verify validation state after removal
      expect(formState['items.0.description.$errors'].value.length).toBe(0)
      expect(formState['items.1.description.$errors'].value.length).toBe(0)
    })
  })
})
