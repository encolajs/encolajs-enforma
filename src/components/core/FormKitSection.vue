<template>
  <div v-bind="$attrs" :class="sectionClass">
    <component
      v-if="sectionSchema?.title"
      :is="sectionSchema.title_component"
      v-bind="sectionSchema.title_props"
    >
      {{ sectionSchema.title }}
    </component>

    {{ sortedFields }}
    <template v-for="field in sortedFields" :key="field.name">
      <FormKitField v-bind="field" />
    </template>

    <template v-for="subSection in sortedSubsections" :key="subSection.name">
      <FormKitSection :name="subSection.name" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { formSchemaKey } from '../../constants/symbols'
import { FieldSchema, FormSectionSchema } from '../../types'
import FormKitField from './FormKitField.vue'
import { FormKitSchema } from '@/types'

interface SectionWithFields extends FormSectionSchema {
  fields: FieldSchema[]
  subsections: Record<string, SectionWithFields>
}

function getFields(
  schema: FormKitSchema,
  sectionName: string
): Record<string, FieldSchema> {
  return Object.fromEntries(
    Object.entries(schema).filter(([_, field]) => {
      if (field.title || field.is_section) {
        return false
      }
      // For default section, include fields without a section
      if (sectionName === 'default') {
        return !('section' in field) || field.section === sectionName
      }
      // For other sections, only include fields that belong to this section
      return field.section === sectionName
    })
  )
}

function getSubSections(
  schema: FormKitSchema,
  sectionName: string
): Record<string, any>[] {
  // Find all sections that belong to this section
  return Object.entries(schema).filter(([key, field]) => {
    if (!field.title && !field.isSection) {
      return false
    }

    // For default section, include fields without a section
    if (sectionName === 'default') {
      return !('section' in field) || field.section === sectionName
    }
    // For other sections, only include fields that belong to this section
    return field.section === sectionName
  })
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

const props = defineProps<{
  name: string
}>()

// Inject dependencies
const schema = inject<FormKitSchema>(formSchemaKey)

// Get the section schema for this section
const sectionSchema = computed(() => {
  const item = schema[props.name]
  if (item && 'section' in item && 'title' in item) {
    return item as FormSectionSchema
  }
  return null
})

// Get fields for this section and sort them by position
const sortedFields = computed(() => {
  const fields = Object.entries(getFields(schema, props.name)).map(
    ([name, field]) => ({ ...field, name })
  )
  return sortByPosition(fields)
})

// Get nested sections and sort them by position
const sortedSubsections = computed(() => {
  const sections = getSubSections(schema, props.name).map(
    ([name, section]) => ({ ...section, name })
  )
  return sortByPosition(sections)
})

// Compute section class
const sectionClass = computed(() => {
  return {
    'formkit-section': true,
    [`formkit-section-${props.name}`]: true,
  }
})
</script>

<style scoped>
.formkit-section {
  margin-bottom: 1rem;
}
</style>
