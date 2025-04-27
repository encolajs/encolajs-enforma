<template>
  <v-btn
    v-bind="
      mergeProps($attrs, getConfig('pt.repeatable.repeatableMoveUpButton'))
    "
    type="button"
    variant="text"
    density="comfortable"
    icon="mdi-arrow-up"
  />
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>
