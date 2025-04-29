import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import EnformaSchema from '@/core/EnformaSchema.vue'
import EnformaSection from '@/core/EnformaSection.vue'
import EnformaField from '@/core/EnformaField.vue'
import EnformaRepeatable from '@/core/EnformaRepeatable.vue'
import { getGlobalConfig, setGlobalConfig } from '@/utils/useConfig'
import { h } from 'vue'

// Create stubs for necessary components
const SubmitButtonStub = {
  name: 'SubmitButton',
  template: '<button type="submit">Submit</button>',
}

const ResetButtonStub = {
  name: 'ResetButton',
  template: '<button type="reset">Reset</button>',
}

const EnformaFieldStub = {
  name: 'EnformaField',
  template:
    '<div class="enforma-field" :data-field-name="name">{{ name }}</div>',
  props: ['name', 'label'],
}

const EnformaRepeatableStub = {
  name: 'EnformaRepeatable',
  template:
    '<div class="enforma-repeatable" :data-field-name="name">{{ name }}</div>',
  props: ['name', 'subfields'],
}

// Custom field component for testing
const CustomField = {
  name: 'CustomField',
  template:
    '<div class="custom-field" data-test-custom-field>{{ field.name }} Custom Implementation</div>',
  props: ['field', 'formController', 'config'],
}

describe('Enforma Field Slots', () => {
  beforeEach(() => {
    const currentConfig = getGlobalConfig()
    // Reset global config before each test
    setGlobalConfig({
      ...currentConfig,
      components: {
        submitButton: 'SubmitButton',
        resetButton: 'ResetButton',
        field: 'EnformaField',
        section: 'EnformaSection',
        schema: 'EnformaSchema',
        repeatable: 'EnformaRepeatable',
      },
      validateOn: 'submit',
    })
  })

  it('renders custom slot for fields when provided', async () => {
    const schema = {
      name: {
        type: 'field',
        label: 'Name',
      },
      address: {
        type: 'field',
        label: 'Address',
      },
      city: {
        type: 'field',
        label: 'City',
      },
    }

    const wrapper = mount(Enforma, {
      props: {
        data: {},
        schema,
        submitHandler: () => {},
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
          EnformaSchema,
          EnformaSection,
          EnformaField: EnformaFieldStub,
          CustomField,
        },
        stubs: {
          EnformaSchema,
          EnformaSection,
        },
      },
      slots: {
        // Define the custom field slot for city
        'field(city)': ({ field }) =>
          h(
            'div',
            {
              class: 'custom-city-field',
              'data-test-custom-field': true,
            },
            `Custom ${field.name} Field`
          ),
      },
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // The city field should use the custom implementation
    const cityField = wrapper.find('[data-test-custom-field]')
    expect(cityField.exists()).toBe(true)
    expect(cityField.text()).toBe('Custom city Field')

    // Find the field with data-field-name="name" to verify other fields are rendered normally
    const nameField = wrapper.find('[data-field-name="name"]')
    expect(nameField.exists()).toBe(true)
  })

  it('renders custom slot for repeatable fields when provided', async () => {
    const schema = {
      experiences: {
        type: 'repeatable',
        label: 'Experiences',
        subfields: {
          company: {
            type: 'field',
            label: 'Company',
          },
          position: {
            type: 'field',
            label: 'Position',
          },
        },
      },
    }

    const wrapper = mount(Enforma, {
      props: {
        data: {
          experiences: [
            {
              company: 'Acme Inc',
              position: 'Developer',
            },
          ],
        },
        schema,
        submitHandler: () => {},
      },
      global: {
        components: {
          SubmitButton: SubmitButtonStub,
          ResetButton: ResetButtonStub,
          EnformaSchema,
          EnformaSection,
          EnformaField: EnformaFieldStub,
          EnformaRepeatable: EnformaRepeatableStub,
        },
        stubs: {
          EnformaSchema,
          EnformaSection,
        },
      },
      slots: {
        // Define the custom field slot for experiences
        'field(experiences)': ({ field }) =>
          h(
            'div',
            {
              class: 'custom-repeatable',
              'data-test-custom-repeatable': true,
            },
            `Custom ${field.name} Component`
          ),
      },
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // The experiences field should use the custom implementation
    const repeatable = wrapper.find('[data-test-custom-repeatable]')
    expect(repeatable.exists()).toBe(true)
    expect(repeatable.text()).toBe('Custom experiences Component')
  })
})
