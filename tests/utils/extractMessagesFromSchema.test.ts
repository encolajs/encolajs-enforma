import { describe, it, expect } from 'vitest'
import { extractMessagesFromSchema } from '@/utils/extractRulesFromSchema'
import type { FormSchema } from '@/types'

describe('extractMessagesFromSchema', () => {
  it('should extract messages from simple field schema', () => {
    const schema: FormSchema = {
      email: {
        type: 'field',
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Email is mandatory',
          email: 'Please enter a valid email',
        },
      },
      name: {
        type: 'field',
        label: 'Name',
        rules: 'required|min_length:3',
        messages: {
          required: 'Name is required',
          min_length: 'Name must be at least 3 characters',
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'email:required': 'Email is mandatory',
      'email:email': 'Please enter a valid email',
      'name:required': 'Name is required',
      'name:min_length': 'Name must be at least 3 characters',
    })
  })

  it('should extract messages from repeatable fields', () => {
    const schema: FormSchema = {
      experiences: {
        type: 'repeatable',
        subfields: {
          title: {
            type: 'field',
            label: 'Title',
            rules: 'required',
            messages: {
              required: 'Job title is required',
            },
          },
          years: {
            type: 'field',
            label: 'Years',
            rules: 'required|numeric|min:0',
            messages: {
              required: 'Years is required',
              numeric: 'Must be a number',
              min: 'Cannot be negative',
            },
          },
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'experiences.*.title:required': 'Job title is required',
      'experiences.*.years:required': 'Years is required',
      'experiences.*.years:numeric': 'Must be a number',
      'experiences.*.years:min': 'Cannot be negative',
    })
  })

  it('should extract messages from repeatable-table fields', () => {
    const schema: FormSchema = {
      skills: {
        type: 'repeatable-table',
        subfields: {
          name: {
            type: 'field',
            label: 'Skill',
            rules: 'required',
            messages: {
              required: 'Skill name is required',
            },
          },
          level: {
            type: 'field',
            label: 'Level',
            rules: 'required|in:beginner,intermediate,advanced',
            messages: {
              required: 'Level is required',
              in: 'Invalid level selected',
            },
          },
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'skills.*.name:required': 'Skill name is required',
      'skills.*.level:required': 'Level is required',
      'skills.*.level:in': 'Invalid level selected',
    })
  })

  it('should handle nested repeatable fields', () => {
    const schema: FormSchema = {
      teams: {
        type: 'repeatable',
        subfields: {
          name: {
            type: 'field',
            label: 'Team Name',
            rules: 'required',
            messages: {
              required: 'Team name is required',
            },
          },
          members: {
            type: 'repeatable',
            subfields: {
              name: {
                type: 'field',
                label: 'Member Name',
                rules: 'required',
                messages: {
                  required: 'Member name is required',
                },
              },
              role: {
                type: 'field',
                label: 'Role',
                rules: 'required|min_length:2',
                messages: {
                  required: 'Role is required',
                  min_length: 'Role must be at least 2 characters',
                },
              },
            },
          },
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'teams.*.name:required': 'Team name is required',
      'teams.*.members.*.name:required': 'Member name is required',
      'teams.*.members.*.role:required': 'Role is required',
      'teams.*.members.*.role:min_length': 'Role must be at least 2 characters',
    })
  })

  it('should ignore fields without messages', () => {
    const schema: FormSchema = {
      email: {
        type: 'field',
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Email is required',
        },
      },
      comment: {
        type: 'field',
        label: 'Comment',
        // No messages
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'email:required': 'Email is required',
    })
  })

  it('should ignore section type schemas', () => {
    const schema: FormSchema = {
      personalInfo: {
        type: 'section',
        title: 'Personal Information',
      },
      name: {
        type: 'field',
        label: 'Name',
        rules: 'required',
        messages: {
          required: 'Name is required',
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'name:required': 'Name is required',
    })
  })

  it('should handle schemas with field name prefix', () => {
    const schema: FormSchema = {
      name: {
        type: 'field',
        label: 'Name',
        rules: 'required',
        messages: {
          required: 'Name is required',
        },
      },
    }

    const messages = extractMessagesFromSchema(schema, 'user')

    expect(messages).toEqual({
      'user.name:required': 'Name is required',
    })
  })

  it('should return empty object for empty schema', () => {
    const schema: FormSchema = {}

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({})
  })

  it('should handle partial messages', () => {
    const schema: FormSchema = {
      email: {
        type: 'field',
        label: 'Email',
        rules: 'required|email',
        messages: {
          required: 'Email is required',
          // email message not provided
        },
      },
    }

    const messages = extractMessagesFromSchema(schema)

    expect(messages).toEqual({
      'email:required': 'Email is required',
    })
  })
})
