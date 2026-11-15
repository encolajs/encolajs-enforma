<template>
  <div v-bind="$attrs">
    <!-- The root: the fields and sections that name no section, ordered by position -->
    <component :is="sectionComponent" name="default" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import type { FormSchema } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import EnformaSection from './EnformaSection.vue'

// The schema its sections read is the form's (provided by Enforma or provideEnformaForm)
defineProps<{
  schema: FormSchema
}>()

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
const sectionComponent = getConfig('components.section') || EnformaSection
</script>
