<!-- src/core/FormKitSchema.vue -->
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
import type { FormKitSchema } from '../types'
import { useFormKitSchema } from './useFormKitSchema'
import { useFormConfig } from '../utils/useFormConfig'

const props = defineProps<{
  schema: FormKitSchema
}>()

const $attrs = useAttrs()
const { sections } = useFormKitSchema(props.schema)
const { getConfig } = useFormConfig()
const sectionComponent = getConfig('components.section')
</script>
