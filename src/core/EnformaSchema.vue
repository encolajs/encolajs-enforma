<!-- src/core/EnformaSchema.vue -->
<template>
  <div v-bind="$attrs">
    {{ sectionComponent }}
    <template v-for="(section, sectionId) in sections" :key="sectionId">
      <component :is="sectionComponent" :name="sectionId" />
    </template>
    <component :is="sectionComponent" name="default" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import type { EnformaSchema } from '@/types'
import { useEnformaSchema } from './useEnformaSchema'
import { useFormConfig } from '@/utils/useFormConfig'

const props = defineProps<{
  schema: EnformaSchema
}>()

const $attrs = useAttrs()
const { sections } = useEnformaSchema(props.schema)
const { getConfig } = useFormConfig()
const sectionComponent = getConfig('components.section')
</script>
