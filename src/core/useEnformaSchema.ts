// src/core/useEnformaSchema.ts
import { computed } from 'vue'
import type { EnformaSchema, FieldSchema, SectionSchema } from '@/types'

export interface SectionWithFields extends SectionSchema {
  fields: FieldSchema[]
  subsections: Record<string, SectionWithFields>
}

export function useEnformaSchema(schema: EnformaSchema) {
  // Get root sections (sections that don't belong to any other section)
  const sections = computed(() => {
    const sections: Record<string, SectionWithFields> = {}

    // First pass: collect all sections
    Object.entries(schema).forEach(([key, item]) => {
      if ('section' in item && 'title' in item) {
        const section = item as SectionSchema
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
      Object.entries(sections).sort(([, a], [, b]) => {
        const aPriority = a.position || 0
        const bPriority = b.position || 0
        return aPriority - bPriority
      })
    )
  })

  return {
    sections,
  }
}
