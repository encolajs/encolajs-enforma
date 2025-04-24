<template>
  <div v-bind="mergeProps($attrs, getConfig('pt.section'))">
    <component
      v-if="sectionSchema?.title"
      :is="sectionSchema.titleComponent"
      v-bind="sectionSchema.titleProps"
    >
      {{ sectionSchema.title }}
    </component>

    <template v-for="field in sortedFields" :key="field.name">
      <component :is="fieldComponent" v-bind="field" />
    </template>

    <template v-for="subSection in sortedSubsections" :key="subSection.name">
      <component :is="sectionComponent" :name="subSection.name" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, resolveComponent, mergeProps } from 'vue'
import { formSchemaKey } from '@/constants/symbols'
import { FieldSchema, SectionSchema, FormSchema } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'

interface FieldWithPosition extends FieldSchema {
  position?: number
  name: string
}

interface SectionWithPosition extends SectionSchema {
  position?: number
  name: string
}

function isSectionSchema(value: any): value is SectionSchema {
  return value && typeof value === 'object' && value?.type === 'section'
}

function getFields(
  schema: FormSchema | undefined,
  sectionName: string
): Record<string, FieldSchema> {
  if (!schema) return {}

  const entries = Object.entries(schema)
    .filter(([_, field]) => {
      if (isSectionSchema(field)) return false

      // For default section, include fields without a section
      if (sectionName === 'default') {
        return !('section' in field) || field.section === sectionName
      }
      // For other sections, only include fields that belong to this section
      return field.section === sectionName
    })
    .map(([key, field]) => [key, field as FieldSchema])

  return Object.fromEntries(entries)
}

function getSubSections(
  schema: FormSchema | undefined,
  sectionName: string
): Array<[string, SectionSchema]> {
  if (!schema) return []

  // Find all sections that belong to this section
  return Object.entries(schema).filter(([_, field]) => {
    if (!isSectionSchema(field)) return false

    // For default section, include fields without a section
    if (sectionName === 'default') {
      return !('section' in field) || field.section === sectionName
    }
    // For other sections, only include fields that belong to this section
    return field.section === sectionName
  }) as Array<[string, SectionSchema]>
}

// Helper function to sort items by position
function sortByPosition<T extends { position?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // If both items have position, sort by position
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position
    }
    // If only one item has position, it comes first
    if (a.position !== undefined) return -1
    if (b.position !== undefined) return 1
    // If neither has position, maintain original order
    return 0
  })
}

// this is needed because the component may render in a tree-like structure
defineOptions({ name: 'EnformaSection' })

const props = defineProps<{
  name: string
}>()

// Inject dependencies
const schema = inject<FormSchema>(formSchemaKey)

// Get the configuration
const { getConfig } = useFormConfig()

const fieldComponent = getConfig('components.field')
// this is needed because the component may render in a tree-like structure
const sectionComponent = resolveComponent('EnformaSection')

// Get the section schema for this section
const sectionSchema = computed(() => {
  if (!schema) return null
  const item = schema[props.name]
  if (isSectionSchema(item)) {
    return item
  }
  return null
})

// Get fields for this section and sort them by position
const sortedFields = computed(() => {
  const fields = Object.entries(getFields(schema, props.name)).map(
    ([name, field]) => {
      const fieldWithPosition: FieldWithPosition = {
        ...field,
        name,
      }
      return fieldWithPosition
    }
  )
  return sortByPosition(fields)
})

// Get nested sections and sort them by position
const sortedSubsections = computed(() => {
  const sections = getSubSections(schema, props.name).map(
    ([name, section]) => ({ ...section, name } as SectionWithPosition)
  )
  return sortByPosition(sections)
})
</script>
