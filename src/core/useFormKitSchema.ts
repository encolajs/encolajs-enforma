// src/core/useFormKitSchema.ts
import { computed } from 'vue'
import type { FormKitSchema, FieldSchema, FormSectionSchema } from '@/types'

export interface SectionWithFields extends FormSectionSchema {
  fields: FieldSchema[]
  subsections: Record<string, SectionWithFields>
}

export function useFormKitSchema(schema: FormKitSchema) {
  // Get root sections (sections that don't belong to any other section)
  const sections = computed(() => {
    const sections: Record<string, SectionWithFields> = {}

    // First pass: collect all sections
    Object.entries(schema).forEach(([key, item]) => {
      if ('section' in item && 'title' in item) {
        const section = item as FormSectionSchema
        if (!section.section) {
          // This is a root section
          sections[key] = {
            ...section,
            fields: [],
            subsections: {},
          }
        }
      }
    })

    // Sort sections by priority
    return Object.fromEntries(
      Object.entries(sections).sort(([, a], [, b]) => a.priority - b.priority)
    )
  })

  return {
    sections,
  }
}
