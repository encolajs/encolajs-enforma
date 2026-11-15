import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import { mountTestComponent } from '../utils/testSetup'

// Mock the submit handler
const mockSubmitHandler = vi.fn(() => Promise.resolve())

describe('Schema Validation Rules', () => {
  beforeEach(() => {
    mockSubmitHandler.mockClear()
  })

  it('should extract validation rules from field schema', async () => {
    const schema = {
      email: {
        type: 'field' as const,
        label: 'Email',
        rules: 'required|email',
      },
      name: {
        type: 'field' as const,
        label: 'Name',
        rules: 'required|min_length:3',
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { email: '', name: '' },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // Check that validation errors are shown
    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    expect(errors.email[0]).toBeDefined()
    expect(errors.name[0]).toBeDefined()
  })

  it('should extract rules from repeatable field subfields', async () => {
    const schema = {
      experiences: {
        type: 'repeatable' as const,
        subfields: {
          title: {
            type: 'field' as const,
            label: 'Title',
            rules: 'required',
          },
          years: {
            type: 'field' as const,
            label: 'Years',
            rules: 'required|numeric|gte:0',
          },
        },
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: {
        experiences: [{ title: '', years: -1 }],
      },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    expect(errors['experiences.0.title'][0]).toBeDefined()
    expect(errors['experiences.0.years'][0]).toBeDefined()
  })

  it('should extract rules from repeatable-table fields', async () => {
    const schema = {
      skills: {
        type: 'repeatable_table' as const,
        subfields: {
          name: {
            type: 'field' as const,
            label: 'Skill',
            rules: 'required',
          },
          level: {
            type: 'field' as const,
            label: 'Level',
            rules: 'required|in_list:beginner,intermediate,advanced',
          },
        },
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: {
        skills: [{ name: '', level: 'expert' }],
      },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()

    expect(errors['skills.0.name'][0]).toBeDefined()
    expect(errors['skills.0.level'][0]).toBeDefined()
  })

  it('should ignore rules on non-field schema items', async () => {
    const schema = {
      personalInfo: {
        type: 'section' as const,
        title: 'Personal Information',
        // Should be ignored even if added
        rules: 'required',
      },
      name: {
        type: 'field' as const,
        label: 'Name',
        rules: 'required',
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { name: '' },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    // Only name should have errors
    expect(errors.name).toBeDefined()
    expect(errors.personalInfo).toBeUndefined()
  })

  it('should keep a field hidden by its if unchecked when a field its rules name changes', async () => {
    const schema = {
      starts_on: {
        type: 'field' as const,
        label: 'Starts on',
        rules: 'required',
      },
      ends_on: {
        type: 'field' as const,
        label: 'Ends on',
        rules: 'required|date_after:@starts_on',
        if: false,
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { starts_on: '2026-01-10', ends_on: null },
      schema,
      submitHandler: mockSubmitHandler,
    })
    await flushPromises()

    // @ts-expect-error vm is a form
    await wrapper.vm.setFieldValue('starts_on', '2026-01-12')
    await flushPromises()

    // @ts-expect-error vm is a form
    expect(await wrapper.vm.validate()).toBe(true)
    // @ts-expect-error vm is a form
    expect(wrapper.vm.hasField('ends_on')).toBe(false)
  })

  it('should check only the fields that are mounted: a field whose component never mounts passes', async () => {
    // A section that draws its title only, as a closed tab whose panel unmounts would
    const Closed = {
      props: ['name', 'title'],
      template: '<h3>{{ title }}</h3>',
    }
    const schema = {
      shown: { type: 'field' as const, label: 'Shown', rules: 'required' },
      later: {
        type: 'section' as const,
        title: 'Later',
        component: 'closed',
      },
      unmounted: {
        type: 'field' as const,
        label: 'Unmounted',
        section: 'later',
        rules: 'required',
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { shown: 'yes', unmounted: '' },
      schema,
      config: { components: { closed: Closed } },
      submitHandler: mockSubmitHandler,
    })
    await flushPromises()

    expect(wrapper.find('h3').text()).toBe('Later')
    // @ts-expect-error vm is a form
    expect(await wrapper.vm.submit()).toBe(true)
    expect(mockSubmitHandler).toHaveBeenCalled()
  })
})
