import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EnformaRepeatableTable from '@/core/EnformaRepeatableTable.vue'
import { useForm } from '@/headless/useForm'
import { useValidation } from '@/utils/useValidation'
import { formStateKey, formConfigKey, formSchemaKey } from '@/constants/symbols'
import { useConfig } from '@/utils/useConfig'
import { provide } from 'vue'
import useDefaultPreset from '../../src/presets/default'

// Stub components for testing
const EnformaFieldStub = {
  name: 'EnformaField',
  template: '<div class="enforma-field">{{ name }}</div>',
  props: ['name'],
}

const EnformaRepeatableAddButtonStub = {
  name: 'EnformaRepeatableAddButton',
  template: '<button type="button" class="add-button">Add</button>',
}

const EnformaRepeatableRemoveButtonStub = {
  name: 'EnformaRepeatableRemoveButton',
  template: '<button type="button" class="remove-button">Remove</button>',
}

const EnformaRepeatableMoveUpButtonStub = {
  name: 'EnformaRepeatableMoveUpButton',
  template: '<button type="button" class="move-up-button">Move Up</button>',
}

const EnformaRepeatableMoveDownButtonStub = {
  name: 'EnformaRepeatableMoveDownButton',
  template: '<button type="button" class="move-down-button">Move Down</button>',
}

describe('EnformaRepeatableTable', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  // Create real form state with validation
  const createFormState = (initialData = {}) => {
    const validation = useValidation()
    return useForm(
      initialData,
      {},
      {
        validatorFactory: validation.factory,
      }
    )
  }

  beforeEach(() => {
    useDefaultPreset()
    vi.clearAllMocks()
  })

  // Helper function to create test wrapper with all required injections
  const createTestWrapper = (props = {}, formState = createFormState()) => {
    const TestWrapper = {
      template: '<EnformaRepeatableTable v-bind="props" />',
      components: {
        EnformaRepeatableTable,
      },
      setup() {
        // Provide injections in setup
        const { config } = useConfig()
        provide(formStateKey, formState)
        provide(formConfigKey, config)
        provide(formSchemaKey, null)

        return {
          props: {
            name: 'items',
            type: 'repeatable_table',
            subfields: {},
            ...props,
          },
        }
      },
      global: {
        components: {
          EnformaField: EnformaFieldStub,
          EnformaRepeatableAddButton: EnformaRepeatableAddButtonStub,
          EnformaRepeatableRemoveButton: EnformaRepeatableRemoveButtonStub,
          EnformaRepeatableMoveUpButton: EnformaRepeatableMoveUpButtonStub,
          EnformaRepeatableMoveDownButton: EnformaRepeatableMoveDownButtonStub,
        },
      },
    }

    return mount(TestWrapper)
  }

  describe('initialization', () => {
    it('mounts with required props and form context', () => {
      const wrapper = createTestWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('errors when mounted without form context', () => {
      mount(EnformaRepeatableTable, {
        props: {
          name: 'items',
          type: 'repeatable_table',
          subfields: {},
        },
        global: {
          components: {
            EnformaField: EnformaFieldStub,
            EnformaRepeatableAddButton: EnformaRepeatableAddButtonStub,
            EnformaRepeatableRemoveButton: EnformaRepeatableRemoveButtonStub,
            EnformaRepeatableMoveUpButton: EnformaRepeatableMoveUpButtonStub,
            EnformaRepeatableMoveDownButton:
              EnformaRepeatableMoveDownButtonStub,
          },
        },
      })

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('must be used within a Enforma form component')
      )
    })
  })

  describe('table structure', () => {
    it('renders table headers from subfield labels', async () => {
      const subfields = {
        name: {
          type: 'text',
          name: 'name',
          label: 'Full Name',
        },
        email: {
          type: 'email',
          name: 'email',
          label: 'Email Address',
        },
      }

      const wrapper = createTestWrapper({ subfields })
      await flushPromises()

      const headers = wrapper.findAll('th')
      expect(headers).toHaveLength(3) // 2 fields + actions column
      expect(headers[0].text()).toBe('Full Name')
      expect(headers[1].text()).toBe('Email Address')
      expect(headers[2].text()).toBe('')
    })

    it('uses field key as header when label is not provided', async () => {
      const subfields = {
        name: {
          type: 'text',
          name: 'name',
        },
        email: {
          type: 'email',
          name: 'email',
        },
      }

      const wrapper = createTestWrapper({ subfields })
      await flushPromises()

      const headers = wrapper.findAll('th')
      expect(headers[0].text()).toBe('name')
      expect(headers[1].text()).toBe('email')
    })
  })

  describe('subfield rendering', () => {
    it('renders subfields in table cells', async () => {
      const formState = createFormState({
        items: [{ name: 'John Doe', email: 'john@example.com' }],
      })
      const subfields = {
        name: {
          type: 'text',
          name: 'name',
        },
        email: {
          type: 'email',
          name: 'email',
        },
      }

      const wrapper = createTestWrapper({ subfields }, formState)
      await flushPromises()

      const fields = wrapper.findAllComponents(EnformaFieldStub)
      expect(fields).toHaveLength(2)
      expect(fields[0].props().name).toBe('items.0.name')
      expect(fields[1].props().name).toBe('items.0.email')
    })
  })

  describe('button rendering and functionality', () => {
    it('shows add button when below max items', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          max: 2,
        },
        formState
      )
      await flushPromises()

      const addButton = wrapper.find('.enforma-repeatable-add-button')
      expect(addButton.exists()).toBe(true)
    })

    it('hides add button when at max items', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          max: 2,
        },
        formState
      )
      await flushPromises()

      const addButton = wrapper.find('.add-button')
      expect(addButton.exists()).toBe(false)
    })

    it('shows remove button on each item when above min items', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          min: 1,
        },
        formState
      )
      await flushPromises()

      const removeButtons = wrapper.findAll('.enforma-repeatable-remove-button')
      expect(removeButtons).toHaveLength(2)
    })

    it('sets disabled on move buttons based on position', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }],
      })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
        },
        formState
      )
      await flushPromises()

      const moveUpButtons = wrapper.findAll(
        '.enforma-repeatable-move-up-button'
      )
      expect(moveUpButtons[0].attributes()['disabled']).toBe('')
      expect(moveUpButtons[1].attributes()['disabled']).toBeUndefined()

      const moveDownButtons = wrapper.findAll(
        '.enforma-repeatable-move-down-button'
      )
      expect(moveDownButtons[1].attributes()['disabled']).toBeUndefined()
      expect(moveDownButtons[2].attributes()['disabled']).toBe('')
    })
  })

  describe('custom button components', () => {
    it('uses custom add button when provided', async () => {
      const CustomAddButton = {
        name: 'CustomAddButton',
        template:
          '<button type="button" class="custom-add-button">Custom Add</button>',
      }

      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          addButton: CustomAddButton,
        },
        formState
      )

      // Add custom component to global components
      wrapper.vm.$options.global.components = {
        ...wrapper.vm.$options.global.components,
        CustomAddButton,
      }

      await flushPromises()

      const addButton = wrapper.find('.custom-add-button')
      expect(addButton.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty subfields object', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper({ subfields: {} }, formState)
      await flushPromises()

      const fields = wrapper.findAllComponents(EnformaFieldStub)
      expect(fields).toHaveLength(0)
    })

    it('handles empty items array', async () => {
      const formState = createFormState({ items: [] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
        },
        formState
      )
      await flushPromises()

      const fields = wrapper.findAllComponents(EnformaFieldStub)
      expect(fields).toHaveLength(0)
      const addButton = wrapper.find('.enforma-repeatable-add-button')
      expect(addButton.exists()).toBe(true)
    })

    it('handles conditional rendering with if prop', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          if: false,
        },
        formState
      )
      await flushPromises()

      const fields = wrapper.findAllComponents(EnformaFieldStub)
      expect(fields).toHaveLength(0)
    })
  })

  describe('cleanup', () => {
    it('unregisters fields on cleanup', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
        },
        formState
      )
      await flushPromises()

      const unregisterSpy = vi.spyOn(formState, 'removeField')
      wrapper.unmount()
      expect(unregisterSpy).toHaveBeenCalledWith('items')
    })
  })
})
