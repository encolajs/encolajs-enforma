import { describe, it, expect } from 'vitest'
import { extractRulesFromSchema } from '@/utils/extractRulesFromSchema'
import type { FormSchema } from '@/types'

describe('extractRulesFromSchema', () => {
  it('should extract rules from simple field schema', () => {
    const schema: FormSchema = {
      email: {
        type: 'field',
        label: 'Email',
        rules: 'required|email',
      },
      name: {
        type: 'field',
        label: 'Name',
        rules: 'required|min_length:3',
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      email: 'required|email',
      name: 'required|min_length:3',
    })
  })

  it('should extract rules from repeatable fields', () => {
    const schema: FormSchema = {
      experiences: {
        type: 'repeatable',
        subfields: {
          title: {
            type: 'field',
            label: 'Title',
            rules: 'required',
          },
          years: {
            type: 'field',
            label: 'Years',
            rules: 'required|numeric|min:0',
          },
        },
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      'experiences.*.title': 'required',
      'experiences.*.years': 'required|numeric|min:0',
    })
  })

  it('should extract rules from repeatable-table fields', () => {
    const schema: FormSchema = {
      skills: {
        type: 'repeatable-table',
        subfields: {
          name: {
            type: 'field',
            label: 'Skill',
            rules: 'required',
          },
          level: {
            type: 'field',
            label: 'Level',
            rules: 'required|in:beginner,intermediate,advanced',
          },
        },
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      'skills.*.name': 'required',
      'skills.*.level': 'required|in:beginner,intermediate,advanced',
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
          },
          members: {
            type: 'repeatable',
            subfields: {
              name: {
                type: 'field',
                label: 'Member Name',
                rules: 'required',
              },
              role: {
                type: 'field',
                label: 'Role',
                rules: 'required|min_length:2',
              },
            },
          },
        },
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      'teams.*.name': 'required',
      'teams.*.members.*.name': 'required',
      'teams.*.members.*.role': 'required|min_length:2',
    })
  })

  it('should ignore fields without rules', () => {
    const schema: FormSchema = {
      email: {
        type: 'field',
        label: 'Email',
        rules: 'required|email',
      },
      comment: {
        type: 'field',
        label: 'Comment',
        // No rules
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      email: 'required|email',
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
      },
    }

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({
      name: 'required',
    })
  })

  it('should handle schemas with field name prefix', () => {
    const schema: FormSchema = {
      name: {
        type: 'field',
        label: 'Name',
        rules: 'required',
      },
    }

    const rules = extractRulesFromSchema(schema, 'user')

    expect(rules).toEqual({
      'user.name': 'required',
    })
  })

  it('should return empty object for empty schema', () => {
    const schema: FormSchema = {}

    const rules = extractRulesFromSchema(schema)

    expect(rules).toEqual({})
  })
})
