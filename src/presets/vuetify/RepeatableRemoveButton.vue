<template>
  <v-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.repeatableRemoveButton'))"
    type="button"
    variant="text"
    density="comfortable"
    icon="mdi-delete"
    color="error"
  />
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>