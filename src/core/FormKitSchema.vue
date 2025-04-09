<!-- src/core/FormKitSchema.vue -->
<template>
  <div v-bind="$attrs">
    <template v-for="(section, sectionId) in sections" :key="sectionId">
      <FormKitSection :name="sectionId" />
    </template>
    <FormKitSection name="default" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import type { FormKitSchema } from '../types'
import FormKitSection from './FormKitSection.vue'
import { useFormKitSchema } from './useFormKitSchema'

const props = defineProps<{
  schema: FormKitSchema
}>()

const $attrs = useAttrs()
const { sections } = useFormKitSchema(props.schema)
</script>
