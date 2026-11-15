<template>
  <div v-bind="mergeProps($attrs, getPassThroughProps('pt.section'))">
    <component
      :is="section.titleComponent"
      v-if="section.title"
      v-bind="section.titleProps"
    >
      {{ section.title }}
    </component>
    <component
      :is="section.descriptionComponent || 'p'"
      v-if="section.description"
      v-bind="section.descriptionProps"
    >
      {{ section.description }}
    </component>

    <EnformaSectionItems :name="name" />
  </div>
</template>

<script setup lang="ts">
// A section of the form's schema: its title, its description, then its items
// (EnformaSectionItems). It draws useEnformaSection(), as a kit's own section can.
import { mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaSection } from './useEnformaSection'
import EnformaSectionItems from './EnformaSectionItems.vue'

defineOptions({ name: 'EnformaSection' })

const props = defineProps<{
  name: string
  title?: string
  titleComponent?: string | object
  titleProps?: object | null
  description?: string
  descriptionComponent?: string | object
  descriptionProps?: object | null
  section?: string | null
  position?: number | null
  columns?: number | Record<string, number> | null
  span?: number | Record<string, number> | null
}>()

const { getPassThroughProps } = useFormConfig()
const { schema: section } = useEnformaSection(
  () => props.name,
  () => props
)
</script>
