import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import FormKitSection from '../../../src/core/FormKitSection.vue'
import {
  formSchemaKey,
  formStateKey,
  formConfigKey,
} from '../../../src/constants/symbols'
import type {
  FormKitSchema,
  FieldSchema,
  FormSectionSchema,
} from '../../../src/types'
import { useForm } from '../../../src/headless/useForm'

// Create a mock schema for testing
const createMockSchema = (
  fields: Record<string, FieldSchema | FormSectionSchema>
): FormKitSchema => {
  return fields as FormKitSchema
}

// Create a mock form config
const createMockConfig = () => ({
  pt: {
    wrapper: { class: 'formkit-field-wrapper' },
    label: { class: 'formkit-label' },
    input: { class: 'formkit-input' },
    error: { class: 'formkit-error' },
    help: { class: 'formkit-help' },
    required: {
      text: '*',
      class: 'required-indicator',
    },
    section: {},
  },
  behavior: {
    validateOn: 'change',
    showErrorsOn: 'dirty',
  },
  expressions: {
    delimiters: {
      start: '${',
      end: '}',
    },
  },
})

describe('FormKitSection', () => {
  // Mock FormKitField component for testing
  const FormKitFieldStub = {
    name: 'FormKitField',
    template: '<div class="formkit-field">{{ name }}</div>',
    props: ['name', 'label', 'type', 'required', 'help', 'if'],
  }

  // Create a fresh form state before each test
  let formState: ReturnType<typeof useForm>

  beforeEach(() => {
    formState = useForm({})
  })

  it('renders section with title', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Test Section',
        priority: 1,
        title_component: 'h2',
        title_props: {},
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Test Section')
  })

  it('renders fields in the correct order based on position', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Section 1',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      field1: {
        section: 'section1',
        type: 'input',
        name: 'field1',
        wrapper: 'div',
        position: 2,
      },
      field2: {
        section: 'section1',
        type: 'input',
        name: 'field2',
        wrapper: 'div',
        position: 1,
      },
      field3: {
        section: 'section1',
        type: 'input',
        name: 'field3',
        wrapper: 'div',
        position: 3,
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const fields = wrapper.findAll('.formkit-input')
    expect(fields[0].attributes()['name']).toBe('field2')
    expect(fields[1].attributes()['name']).toBe('field1')
    expect(fields[2].attributes()['name']).toBe('field3')
  })

  it('renders fields without position after fields with position', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Section 1',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      field1: {
        section: 'section1',
        type: 'input',
        name: 'field1',
        wrapper: 'div',
        position: 1,
      },
      field2: {
        section: 'section1',
        type: 'input',
        name: 'field2',
        wrapper: 'div',
      },
      field3: {
        section: 'section1',
        type: 'input',
        name: 'field3',
        wrapper: 'div',
        position: 2,
      },
      field4: {
        section: 'section1',
        type: 'input',
        name: 'field4',
        wrapper: 'div',
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const fields = wrapper.findAll('.formkit-input')
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field3')
    expect(fields[2].attributes()['name']).toBe('field2')
    expect(fields[3].attributes()['name']).toBe('field4')
  })

  it('renders nested sections in the correct order', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Section 1',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      subsection1: {
        section: 'section1',
        title: 'Subsection 1',
        position: 2,
        title_component: 'h3',
        title_props: {},
        priority: 1,
      },
      subsection2: {
        section: 'section1',
        title: 'Subsection 2',
        position: 1,
        title_component: 'h3',
        title_props: {},
        priority: 0,
      },
      subsection3: {
        section: 'section1',
        title: 'Subsection 3',
        position: 3,
        title_component: 'h3',
        title_props: {},
        priority: 1,
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const sections = wrapper.findAll('.formkit-section h3')
    expect(sections[0].text()).toBe('Subsection 2')
    expect(sections[1].text()).toBe('Subsection 1')
    expect(sections[2].text()).toBe('Subsection 3')
  })

  it('includes fields without section in the default section', async () => {
    const schema = createMockSchema({
      default: {
        section: 'root',
        title: 'Default Section',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      field1: {
        type: 'input',
        name: 'field1',
        wrapper: 'div',
      },
      field2: {
        section: 'default',
        type: 'input',
        name: 'field2',
        wrapper: 'div',
      },
      field3: {
        type: 'input',
        name: 'field3',
        wrapper: 'div',
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'default',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const fields = wrapper.findAll('.formkit-input')
    expect(fields.length).toBe(3)
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field2')
    expect(fields[2].attributes()['name']).toBe('field3')
  })

  it('excludes fields from other sections', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Section 1',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      field1: {
        section: 'section1',
        type: 'input',
        name: 'field1',
        wrapper: 'div',
      },
      field2: {
        section: 'section2',
        type: 'input',
        name: 'field2',
        wrapper: 'div',
      },
      field3: {
        section: 'section1',
        type: 'input',
        name: 'field3',
        wrapper: 'div',
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const fields = wrapper.findAll('.formkit-input')
    expect(fields.length).toBe(2)
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field3')
  })

  it('applies correct section classes', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Test Section',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const section = wrapper.find('.formkit-section')
    expect(section.exists()).toBe(true)
    expect(section.classes()).toContain('formkit-section-section1')
  })

  it('handles empty sections gracefully', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'root',
        title: 'Empty Section',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const fields = wrapper.findAll('.formkit-input')
    expect(fields.length).toBe(0)
    expect(wrapper.find('h2').text()).toBe('Empty Section')
  })

  it('handles deeply nested sections', async () => {
    const schema = createMockSchema({
      section1: {
        section: 'default',
        title: 'Root Section',
        title_component: 'h2',
        title_props: {},
        priority: 1,
      },
      subsection1: {
        section: 'section1',
        title: 'Subsection 1',
        title_component: 'h3',
        title_props: {},
        priority: 1,
      },
      subsubsection1: {
        section: 'subsection1',
        title: 'Sub-subsection 1',
        title_component: 'h4',
        title_props: {},
        priority: 1,
      },
      field1: {
        section: 'subsubsection1',
        type: 'input',
        name: 'field1',
        wrapper: 'div',
      },
    })

    const wrapper = mount(FormKitSection, {
      props: {
        name: 'section1',
      },
      global: {
        components: {
          FormKitField: FormKitFieldStub,
        },
        provide: {
          [formSchemaKey]: schema,
          [formStateKey]: formState,
          [formConfigKey]: createMockConfig(),
        },
      },
    })

    await flushPromises()
    const sections = wrapper.findAll('.formkit-section')
    expect(sections.length).toBe(3) // section1, subsection1, subsubsection1
    expect(sections[0].find('h3').text()).toBe('Subsection 1')
    expect(sections[1].find('h4').text()).toBe('Sub-subsection 1')
    expect(wrapper.find('.formkit-input').attributes()['name']).toBe('field1')
  })
})
