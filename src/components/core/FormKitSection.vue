<template>
  <div v-bind="$attrs" :class="sectionClass">
    <!-- Render section title if it exists -->
    <component
      v-if="section.title"
      :is="section.title_component"
      v-bind="section.title_props"
    >
      {{ section.title }}
    </component>

    <!-- Render fields -->
    <template v-for="field in visibleFields" :key="field.name">
      <FormKitField v-bind="field" />
    </template>

    <!-- Render nested sections -->
    <template v-for="(subSection, subSectionId) in nestedSections" :key="subSectionId">
      <FormKitSection
        :name="subSectionId"
        :section="subSection"
      />
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

function getSectionFields(
  schema: FormKitSchema,
  sectionName: string
): Record<string, FieldSchema> {
  return Object.fromEntries(
    Object.entries(schema).filter(([_, field]) => {
      // For default section, include fields without a section
      if (sectionName === 'default') {
        return !('section' in field) || field.section === sectionName
      }
      // For other sections, only include fields that belong to this section
      return field.section === sectionName
    })
  )
}

function getNestedSections(
  schema: FormKitSchema,
  sectionName: string
): Record<string, SectionWithFields> {
  const sections: Record<string, SectionWithFields> = {}
  
  // Find all sections that belong to this section
  Object.entries(schema).forEach(([key, item]) => {
    if ('section' in item && 'title' in item) {
      const section = item as FormSectionSchema
      if (section.section === sectionName) {
        sections[key] = {
          ...section,
          fields: [],
          subsections: {}
        }
      }
    }
  })

  return sections
}

const props = defineProps<{
  name: string
  section?: SectionWithFields
}>()

// Inject dependencies
const schema = inject<FormKitSchema>(formSchemaKey)

// Get fields for this section
const visibleFields = computed(() => {
  return Object.entries(getSectionFields(schema, props.name))
    .map(([name, field]) => ({ ...field, name }))
})

// Get nested sections
const nestedSections = computed(() => {
  return getNestedSections(schema, props.name)
})

// Compute section class
const sectionClass = computed(() => {
  return {
    'formkit-section': true,
    [`formkit-section-${props.name}`]: true
  }
})
</script>

<style scoped>
.formkit-section {
  margin-bottom: 1rem;
}
</style>
