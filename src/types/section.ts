/**
 * Type definitions for form sections
 */

import { FieldSchema } from './fields'

/**
 * Definition of a form section in schema
 */
export interface SectionSchema {
  name: string
  title?: string
  description?: string
  if?: string | boolean
  order?: number
  props?: Record<string, any>
  [key: string]: any
}

/**
 * Form schema with sections
 */
export interface FormSectionsSchema {
  sections?: Record<string, SectionSchema>
  fields: Record<string, FieldSchema>
  validation_rules?: Record<string, string>
  validation_messages?: Record<string, string>
}

/**
 * Section descriptor for rendering
 */
export interface SectionDescriptor {
  schema: SectionSchema
  name: string
  visible: boolean
  fields: string[]
  props: Record<string, any>
  [key: string]: any
}

/**
 * Get fields that belong to a section
 */
export function getSectionFields(
  fields: Record<string, FieldSchema>,
  sectionName: string
): Record<string, FieldSchema> {
  return Object.fromEntries(
    Object.entries(fields).filter(([_, field]) => field.section === sectionName)
  )
}

/**
 * Group fields by section
 */
export function groupFieldsBySection(
  fields: Record<string, FieldSchema>
): Record<string, Record<string, FieldSchema>> {
  const sections: Record<string, Record<string, FieldSchema>> = {}

  // First pass - identify all sections
  Object.values(fields).forEach((field) => {
    const section = field.section || 'default'
    if (!sections[section]) {
      sections[section] = {}
    }
  })

  // Second pass - group fields by section
  Object.entries(fields).forEach(([name, field]) => {
    const section = field.section || 'default'
    sections[section][name] = field
  })

  return sections
}

/**
 * Sort sections by their order property
 */
export function sortSections(
  sections: Record<string, SectionSchema>
): SectionSchema[] {
  return Object.values(sections).sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : Infinity
    const orderB = b.order !== undefined ? b.order : Infinity
    return orderA - orderB
  })
}

/**
 * Get section schema, creating a default if not defined
 */
export function getSectionSchema(
  sections: Record<string, SectionSchema> | undefined,
  sectionName: string
): SectionSchema {
  // If section exists in schema, return it
  if (sections && sections[sectionName]) {
    return sections[sectionName]
  }

  // Otherwise create a default section schema
  return {
    name: sectionName,
    title: sectionName === 'default' ? undefined : sectionName,
  }
}
