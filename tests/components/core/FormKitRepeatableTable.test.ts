import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FormKitRepeatableTable from '../../../src/core/FormKitRepeatableTable.vue'
import { FormController, useForm, useValidation } from '../../../src'
import { formStateKey, formConfigKey } from '../../../src/constants/symbols'
import { useConfig } from '../../../src/utils/useConfig'
import { provide } from 'vue'

// Stub components for testing
const FormKitFieldStub = {
  name: 'FormKitField',
  template: '<div class="formkit-field">{{ name }}</div>',
  props: ['name'],
}

const FormKitRepeatableAddButtonStub = {
  name: 'FormKitRepeatableAddButton',
  template: '<button type="button" class="add-button">Add</button>',
}

const FormKitRepeatableRemoveButtonStub = {
  name: 'FormKitRepeatableRemoveButton',
  template: '<button type="button" class="remove-button">Remove</button>',
}

const FormKitRepeatableMoveUpButtonStub = {
  name: 'FormKitRepeatableMoveUpButton',
  template: '<button type="button" class="move-up-button">Move Up</button>',
}

const FormKitRepeatableMoveDownButtonStub = {
  name: 'FormKitRepeatableMoveDownButton',
  template: '<button type="button" class="move-down-button">Move Down</button>',
}

describe('FormKitRepeatableTable', () => {
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
    vi.clearAllMocks()
  })

  // Helper function to create test wrapper with all required injections
  const createTestWrapper = (props = {}, formState = createFormState()) => {
    const TestWrapper = {
      template: '<FormKitRepeatableTable v-bind="props" />',
      components: {
        FormKitRepeatableTable,
      },
      setup() {
        // Provide injections in setup
        const { config } = useConfig()
        provide(formStateKey, formState)
        provide(formConfigKey, config.value)

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
          FormKitField: FormKitFieldStub,
          FormKitRepeatableAddButton: FormKitRepeatableAddButtonStub,
          FormKitRepeatableRemoveButton: FormKitRepeatableRemoveButtonStub,
          FormKitRepeatableMoveUpButton: FormKitRepeatableMoveUpButtonStub,
          FormKitRepeatableMoveDownButton: FormKitRepeatableMoveDownButtonStub,
        },
      },
    }

    return mount(TestWrapper)
  }

  describe('Component initialization', () => {
    it('mounts with required props and form context', () => {
      const wrapper = createTestWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('errors when mounted without form context', () => {
      mount(FormKitRepeatableTable, {
        props: {
          name: 'items',
          type: 'repeatable_table',
          subfields: {},
        },
        global: {
          components: {
            FormKitField: FormKitFieldStub,
            FormKitRepeatableAddButton: FormKitRepeatableAddButtonStub,
            FormKitRepeatableRemoveButton: FormKitRepeatableRemoveButtonStub,
            FormKitRepeatableMoveUpButton: FormKitRepeatableMoveUpButtonStub,
            FormKitRepeatableMoveDownButton:
              FormKitRepeatableMoveDownButtonStub,
          },
        },
      })

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('must be used within a FormKit form component')
      )
    })
  })

  describe('Table structure', () => {
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
      expect(headers[2].text()).toBe('Actions')
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

  describe('Subfield rendering', () => {
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

      const fields = wrapper.findAllComponents(FormKitFieldStub)
      expect(fields).toHaveLength(2)
      expect(fields[0].props().name).toBe('items.0.name')
      expect(fields[1].props().name).toBe('items.0.email')
    })
  })

  describe('Button rendering and functionality', () => {
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

      const addButton = wrapper.find('.formkit-repeatable-add-button')
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

      const removeButtons = wrapper.findAll('.formkit-repeatable-remove-button')
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
        '.formkit-repeatable-move-up-button'
      )
      expect(moveUpButtons[0].attributes()['disabled']).toBe('')
      expect(moveUpButtons[1].attributes()['disabled']).toBeUndefined()

      const moveDownButtons = wrapper.findAll(
        '.formkit-repeatable-move-down-button'
      )
      expect(moveDownButtons[1].attributes()['disabled']).toBeUndefined()
      expect(moveDownButtons[2].attributes()['disabled']).toBe('')
    })
  })

  describe('Custom button components', () => {
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

  describe('Edge cases', () => {
    it('handles empty subfields object', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper({ subfields: {} }, formState)
      await flushPromises()

      const fields = wrapper.findAllComponents(FormKitFieldStub)
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

      const fields = wrapper.findAllComponents(FormKitFieldStub)
      expect(fields).toHaveLength(0)
      const addButton = wrapper.find('.formkit-repeatable-add-button')
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

      const fields = wrapper.findAllComponents(FormKitFieldStub)
      expect(fields).toHaveLength(0)
    })
  })

  describe('Cleanup', () => {
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
