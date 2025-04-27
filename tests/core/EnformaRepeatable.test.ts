import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EnformaRepeatable from '../../src/core/EnformaRepeatable.vue'
// @ts-ignore
import { useForm } from '@/headless/useForm'
// @ts-ignore
import { useValidation } from '@/utils/useValidation'
import {
  formConfigKey,
  formControllerKey,
  formSchemaKey,
  // @ts-ignore
} from '@/constants/symbols'
import { provide } from 'vue'
import useDefaultPreset from '../../src/presets/default'
import { useFormConfig } from '../../src'

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

// Custom components for component-based subfields testing
const CustomComponent = {
  name: 'CustomComponent',
  template:
    '<div class="custom-component">{{ name }} - {{ index }} - {{ value }} - {{ listLength }}</div>',
  props: ['name', 'index', 'value', 'listLength'],
}

const CustomComponentWithExtraProps = {
  name: 'CustomComponentWithExtraProps',
  template:
    '<div class="custom-component">{{ name }} - {{ index }} - {{ value }} - {{ listLength }} - {{ extraProp }}</div>',
  props: ['name', 'index', 'value', 'listLength', 'extraProp'],
}

const SimpleCustomComponent = {
  name: 'SimpleCustomComponent',
  template: '<div class="custom-component">Custom</div>',
}

describe('EnformaRepeatable', () => {
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
      template: '<EnformaRepeatable v-bind="props" />',
      components: {
        EnformaRepeatable,
      },
      setup() {
        // Provide injections in setup
        const { formConfig } = useFormConfig(false)
        provide(formControllerKey, formState)
        provide(formSchemaKey, null)
        provide(formConfigKey, formConfig)

        return {
          props: {
            name: 'items',
            type: 'repeatable',
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
          CustomComponent,
          CustomComponentWithExtraProps,
          SimpleCustomComponent,
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
      mount(EnformaRepeatable, {
        props: {
          name: 'items',
          type: 'repeatable',
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

  describe('subfield rendering', () => {
    it('renders subfields for each item', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
      const subfields = {
        name: {
          type: 'input',
          name: 'name',
        },
      }

      const wrapper = createTestWrapper({ subfields }, formState)
      await flushPromises()

      const fields = wrapper.findAllComponents(EnformaFieldStub)
      expect(fields).toHaveLength(2)
      expect(fields[0].props().name).toBe('items.0.name')
      expect(fields[1].props().name).toBe('items.1.name')
    })

    it('renders multiple subfields per item', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1', email: 'item1@test.com' }],
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

      const addButton = wrapper.find('.enforma-repeatable-add-button')
      expect(addButton.exists()).toBe(false)
    })

    it('shows button on each item min items', async () => {
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

    it('honors allowAdd=false prop to hide add button', async () => {
      const formState = createFormState({ items: [{ name: 'Item 1' }] })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          allowAdd: false,
        },
        formState
      )
      await flushPromises()

      const addButton = wrapper.find('.enforma-repeatable-add-button')
      expect(addButton.exists()).toBe(false)
    })

    it('honors allowRemove=false prop to hide remove buttons', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          allowRemove: false,
        },
        formState
      )
      await flushPromises()

      const removeButtons = wrapper.findAll('.remove-button')
      expect(removeButtons).toHaveLength(0)
    })

    it('honors allowSort=false prop to hide sort buttons', async () => {
      const formState = createFormState({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      })
      const wrapper = createTestWrapper(
        {
          subfields: { name: { type: 'text', name: 'name' } },
          allowSort: false,
        },
        formState
      )
      await flushPromises()

      const moveUpButtons = wrapper.findAll('.move-up-button')
      const moveDownButtons = wrapper.findAll('.move-down-button')
      expect(moveUpButtons).toHaveLength(0)
      expect(moveDownButtons).toHaveLength(0)
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
