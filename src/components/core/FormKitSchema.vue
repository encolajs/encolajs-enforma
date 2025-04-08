<template>
  <div v-bind="$attrs">
    <template v-for="(section, sectionId) in rootSections" :key="sectionId">
      <FormKitSection
        :name="sectionId"
        :section="section"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAttrs } from 'vue'
import type { FormKitSchema, FieldSchema, FormSectionSchema } from '../../types'
import FormKitSection from './FormKitSection.vue'

const props = defineProps<{
  schema: FormKitSchema
}>()

const $attrs = useAttrs()

interface SectionWithFields extends FormSectionSchema {
  fields: FieldSchema[]
  subsections: Record<string, SectionWithFields>
}

// Get root sections (sections that don't belong to any other section)
const rootSections = computed(() => {
  const sections: Record<string, SectionWithFields> = {}
  
  // First pass: collect all sections
  Object.entries(props.schema).forEach(([key, item]) => {
    if ('section' in item && 'title' in item) {
      const section = item as FormSectionSchema
      if (!section.section) {
        // This is a root section
        sections[key] = {
          ...section,
          fields: [],
          subsections: {}
        }
      }
    }
  })

  // Sort sections by priority
  return Object.fromEntries(
    Object.entries(sections).sort(([, a], [, b]) => a.priority - b.priority)
  )
})
</script>

<style scoped>
.required {
  color: red;
  margin-left: 4px;
}
</style>
