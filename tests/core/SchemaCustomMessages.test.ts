import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Enforma from '@/core/Enforma.vue'
import '@/utils/license'
import { mountTestComponent } from '../utils/testSetup'

// Mock the submit handler
const mockSubmitHandler = vi.fn(() => Promise.resolve())

describe('Schema Custom Messages', () => {
  beforeEach(() => {
    mockSubmitHandler.mockClear()
  })

  it('should extract custom messages from field schema', async () => {
    const schema = {
      email: {
        type: 'field' as const,
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Please provide your email address',
          email: 'Enter a valid email address',
        },
      },
      name: {
        type: 'field' as const,
        label: 'Name',
        rules: 'required|min_length:3',
        messages: {
          required: 'Name is mandatory',
          min_length: 'Name must be at least 3 characters',
        },
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { email: 'invalid-email', name: 'ab' },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // Check that custom messages are used
    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()

    // Invalid email should use custom message
    expect(errors.email[0]).toBe('Enter a valid email address')

    // Name too short should use custom message
    expect(errors.name[0]).toBe('Name must be at least 3 characters')
  })

  it('should extract messages from repeatable field subfields', async () => {
    const schema = {
      experiences: {
        type: 'repeatable' as const,
        subfields: {
          title: {
            type: 'field' as const,
            label: 'Title',
            rules: 'required',
            messages: {
              required: 'Job title is required',
            },
          },
          years: {
            type: 'field' as const,
            label: 'Years',
            rules: 'required|numeric|gte:0',
            messages: {
              required: 'Years of experience is required',
              numeric: 'Years must be a number',
              gte: 'Years cannot be negative',
            },
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
    expect(errors['experiences.0.title'][0]).toBe('Job title is required')
    expect(errors['experiences.0.years'][0]).toBe('Years cannot be negative')
  })

  it('should prioritize provided messages over schema messages', async () => {
    const schema = {
      email: {
        type: 'field' as const,
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Schema message: Email required',
          email: 'Schema message: Invalid email',
        },
      },
    }

    const providedMessages = {
      'email:required': 'Prop message: Email is required',
      'email:email': 'Prop message: Invalid email format',
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { email: 'invalid' },
      schema,
      messages: providedMessages,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    // Should use provided messages, not schema messages
    expect(errors.email[0]).toBe('Prop message: Invalid email format')
  })

  it('should handle schema without messages', async () => {
    const schema = {
      email: {
        type: 'field' as const,
        label: 'Email',
        rules: 'required|email',
        // No messages defined
      },
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { email: 'invalid' },
      schema,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()
    // Should use default validator messages
    expect(errors.email[0]).toBeDefined()
    // Should not be a custom message we defined
    expect(errors.email[0]).not.toBe('Custom email message')
  })

  it('should ignore messages on non-field schema items', async () => {
    const schema = {
      personalInfo: {
        type: 'section' as const,
        title: 'Personal Information',
        // Messages should be ignored on sections
        // @ts-expect-error messages don't exist on sections
        messages: {
          required: 'This should be ignored',
        },
      },
      name: {
        type: 'field' as const,
        label: 'Name',
        rules: 'required',
        messages: {
          required: 'Name is required',
        },
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
    // Only name should have custom message
    expect(errors.name[0]).toBe('Name is required')
    expect(errors.personalInfo).toBeUndefined()
  })

  it('should handle repeatable-table field messages', async () => {
    const schema = {
      skills: {
        type: 'repeatable_table' as const,
        subfields: {
          name: {
            type: 'field' as const,
            label: 'Skill',
            rules: 'required',
            messages: {
              required: 'Skill name cannot be empty',
            },
          },
          level: {
            type: 'field' as const,
            label: 'Level',
            rules: 'required|in_list:beginner,intermediate,advanced',
            messages: {
              required: 'Please select a skill level',
              in_list: 'Invalid skill level selected',
            },
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
    expect(errors['skills.0.name'][0]).toBe('Skill name cannot be empty')
    expect(errors['skills.0.level'][0]).toBe('Invalid skill level selected')
  })

  it('should not merge schema messages with provided messages', async () => {
    const schema = {
      email: {
        type: 'field' as const,
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Schema: Email required',
        },
      },
    }

    const providedMessages = {
      'email.email': 'Prop: Invalid email',
    }

    const wrapper = mountTestComponent(Enforma, {
      data: { email: '' },
      schema,
      messages: providedMessages,
      submitHandler: mockSubmitHandler,
    })

    // Submit form to trigger validation
    // @ts-expect-error vm is a form
    await wrapper.vm.submit()
    await flushPromises()

    // @ts-expect-error errors() exists on vm
    const errors = wrapper.vm.errors()

    // Should use provided messages exclusively (not merged with schema)
    // The required message should be default, not from schema
    expect(errors.email[0]).not.toBe('Schema: Email required')
  })
})
