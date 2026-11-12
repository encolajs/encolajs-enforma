<template>
  <div v-bind="$attrs">
    <template v-for="(section, sectionId) in sections" :key="sectionId">
      <component :is="sectionComponent" :name="sectionId" />
    </template>
    <component :is="sectionComponent" name="default" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import type { FormSchema } from '@/types'
import { useEnformaSchema } from './useEnformaSchema'
import { useFormConfig } from '@/utils/useFormConfig'
import EnformaSection from './EnformaSection.vue'

const props = defineProps<{
  schema: FormSchema
}>()

const $attrs = useAttrs()
// A getter, so a replaced schema is followed
const { sections } = useEnformaSchema(() => props.schema)
const { getConfig } = useFormConfig()
const sectionComponent = getConfig('components.section') || EnformaSection
</script>
