import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { computed } from 'vue'
import EnformaSection from '../../src/core/EnformaSection.vue'
import {
  formSchemaKey,
  formControllerKey,
  FormSchema,
  FieldSchema,
  SectionSchema,
} from '../../src/'
import { useForm } from '../../src'
import { mountTestComponent } from '../utils/testSetup'

// Create a mock schema for testing
const createMockSchema = (
  fields: Record<string, FieldSchema | SectionSchema>
): FormSchema => {
  return fields as FormSchema
}

describe('EnformaSection', () => {
  // Mock EnformaField component for testing
  const EnformaFieldStub = {
    name: 'EnformaField',
    template: '<div class="enforma-field">{{ name }}</div>',
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
        type: 'section',
        section: 'root',
        title: 'Test Section',
        position: 1,
        titleComponent: 'h2',
        titleProps: {},
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Test Section')
  })

  it('renders fields in the correct order based on position', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Section 1',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      field1: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
        position: 2,
      },
      field2: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
        position: 1,
      },
      field3: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
        position: 3,
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const fields = wrapper.findAll('.enforma-input')
    expect(fields[0].attributes()['name']).toBe('field2')
    expect(fields[1].attributes()['name']).toBe('field1')
    expect(fields[2].attributes()['name']).toBe('field3')
  })

  it('renders fields without position after fields with position', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Section 1',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      field1: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
        position: 1,
      },
      field2: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
      },
      field3: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
        position: 2,
      },
      field4: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          components: {
            EnformaField: EnformaFieldStub,
          },
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const fields = wrapper.findAll('.enforma-input')
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field3')
    expect(fields[2].attributes()['name']).toBe('field2')
    expect(fields[3].attributes()['name']).toBe('field4')
  })

  it('renders nested sections in the correct order', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Section 1',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      subsection1: {
        type: 'section',
        section: 'section1',
        title: 'Subsection 1',
        titleComponent: 'h3',
        titleProps: {},
        position: 1,
      },
      subsection2: {
        type: 'section',
        section: 'section1',
        title: 'Subsection 2',
        titleComponent: 'h3',
        titleProps: {},
        position: 0,
      },
      subsection3: {
        type: 'section',
        section: 'section1',
        title: 'Subsection 3',
        titleComponent: 'h3',
        titleProps: {},
        position: 1,
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const sections = wrapper.findAll('.enforma-section h3')
    expect(sections[0].text()).toBe('Subsection 2')
    expect(sections[1].text()).toBe('Subsection 1')
    expect(sections[2].text()).toBe('Subsection 3')
  })

  it('includes fields without section in the default section', async () => {
    const schema = createMockSchema({
      default: {
        type: 'section',
        section: 'root',
        title: 'Default Section',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      field1: {
        type: 'field',
        inputComponent: 'input',
        component: 'div',
      },
      field2: {
        type: 'field',
        section: 'default',
        inputComponent: 'input',
        component: 'div',
      },
      field3: {
        type: 'field',
        inputComponent: 'input',
        component: 'div',
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'default',
      },
      {
        global: {
          components: {
            EnformaField: EnformaFieldStub,
          },
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const fields = wrapper.findAll('.enforma-input')
    expect(fields.length).toBe(3)
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field2')
    expect(fields[2].attributes()['name']).toBe('field3')
  })

  it('excludes fields from other sections', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Section 1',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      field1: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
      },
      field2: {
        type: 'field',
        section: 'section2',
        inputComponent: 'input',
        component: 'div',
      },
      field3: {
        type: 'field',
        section: 'section1',
        inputComponent: 'input',
        component: 'div',
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          components: {
            EnformaField: EnformaFieldStub,
          },
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const fields = wrapper.findAll('.enforma-input')
    expect(fields.length).toBe(2)
    expect(fields[0].attributes()['name']).toBe('field1')
    expect(fields[1].attributes()['name']).toBe('field3')
  })

  it('applies correct section classes', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Test Section',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const section = wrapper.find('.enforma-section')
    expect(section.exists()).toBe(true)
  })

  it('handles empty sections gracefully', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'root',
        title: 'Empty Section',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          components: {
            EnformaField: EnformaFieldStub,
          },
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const fields = wrapper.findAll('.enforma-input')
    expect(fields.length).toBe(0)
    expect(wrapper.find('h2').text()).toBe('Empty Section')
  })

  it('handles deeply nested sections', async () => {
    const schema = createMockSchema({
      section1: {
        type: 'section',
        section: 'default',
        title: 'Root Section',
        titleComponent: 'h2',
        titleProps: {},
        position: 1,
      },
      subsection1: {
        type: 'section',
        section: 'section1',
        title: 'Subsection 1',
        titleComponent: 'h3',
        titleProps: {},
        position: 1,
      },
      subsubsection1: {
        type: 'section',
        section: 'subsection1',
        title: 'Sub-subsection 1',
        titleComponent: 'h4',
        titleProps: {},
        position: 1,
      },
      field1: {
        type: 'field',
        section: 'subsubsection1',
        inputComponent: 'input',
        component: 'div',
      },
    })

    const wrapper = mountTestComponent(
      EnformaSection,
      {
        name: 'section1',
      },
      {
        global: {
          provide: {
            [formSchemaKey]: computed(() => schema),
            [formControllerKey]: formState,
          },
        },
      }
    )

    await flushPromises()
    const sections = wrapper.findAll('.enforma-section')
    expect(sections.length).toBe(3) // section1, subsection1, subsubsection1
    expect(sections[0].find('h3').text()).toBe('Subsection 1')
    expect(sections[1].find('h4').text()).toBe('Sub-subsection 1')
    expect(wrapper.find('.enforma-input').attributes()['name']).toBe('field1')
  })
})
