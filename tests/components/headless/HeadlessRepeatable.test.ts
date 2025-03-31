import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import HeadlessRepeatable from '../../../src/components/headless/HeadlessRepeatable'
import { FormStateReturn, useFormState, useValidation } from '../../../src'
import { PlainObjectDataSource } from '@encolajs/validator'
import { formStateKey } from '../../../src/constants/symbols'

describe('HeadlessRepeatable', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Create real form state with validation
  const createFormState = (initialData = {}) => {
    const validation = useValidation()
    return useFormState(
      new PlainObjectDataSource(initialData),
      {},
      {
        validatorFactory: validation.factory,
      }
    )
  }

  describe('Component initialization', () => {
    it('mounts with required props and form context', () => {
      const formState = createFormState()
      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
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
      let slotProps: FormStateReturn

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
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
        fields: expect.any(Array),
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

  describe('Array manipulation', () => {
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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Can add one more item
      expect(slotData.canAdd).toBe(true)
      await slotData.add('item2')
      expect(formState.getData().items).toEqual(['item1', 'item2'])

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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Can remove one item
      expect(slotData.canRemove).toBe(true)
      await slotData.remove(0)
      expect(formState.getData().items).toEqual(['item2'])

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
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      await slotData.move(0, 2)
      expect(formState.getData().items).toEqual(['item2', 'item3', 'item1'])
    })
  })

  describe('Validation', () => {
    it('validates the array when validateOnAdd is true', async () => {
      const formState = createFormState({ items: ['item1'] })
      const validateSpy = vi.spyOn(formState, 'validateField')
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          validateOnAdd: true,
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      await slotData.add()
      expect(validateSpy).toHaveBeenCalledWith('items', false)
    })

    it('validates the array when validateOnRemove is true', async () => {
      const formState = createFormState({ items: ['item1', 'item2', 'item3'] })
      const validateSpy = vi.spyOn(formState, 'validateField')
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
          validateOnRemove: true,
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      await slotData.remove(1)
      expect(validateSpy).toHaveBeenCalledWith('items', false)
    })
  })

  describe('Field tracking', () => {
    it('tracks fields for array items', () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      formState.registerField('items.0')
      formState.registerField('items.1')

      expect(slotData.fields.length).toBe(2)
      expect(formState.getField('items.0')).toBeTruthy()
      expect(formState.getField('items.1')).toBeTruthy()
    })
  })

  describe('Edge cases', () => {
    it('handles non-array initial values', () => {
      const formState = createFormState({ items: 'not-an-array' })
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      expect(slotData.value).toEqual(['not-an-array'])
    })

    it('handles undefined initial values', () => {
      const formState = createFormState({})
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      expect(slotData.value).toEqual([])
    })

    it('prevents invalid move operations', async () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      const setValueSpy = vi.spyOn(formState, 'setFieldValue')
      let slotData

      mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
        slots: {
          default: (data) => {
            slotData = data
            return h('div')
          },
        },
      })

      // Cannot move up first item
      await slotData.moveUp(0)
      expect(setValueSpy).not.toHaveBeenCalled()

      // Cannot move down last item
      await slotData.moveDown(1)
      expect(setValueSpy).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('unregisters fields on cleanup', () => {
      const formState = createFormState({ items: ['item1', 'item2'] })
      const unregisterSpy = vi.spyOn(formState, 'unregisterField')

      const wrapper = mount(HeadlessRepeatable, {
        props: {
          name: 'items',
        },
        global: {
          provide: {
            [formStateKey]: formState,
          },
        },
      })

      wrapper.unmount()
      expect(unregisterSpy).toHaveBeenCalled()
    })
  })
})
