<template>
  <v-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.repeatableAddButton'))"
    type="button"
    variant="tonal"
    prepend-icon="mdi-plus"
  >
    {{ t('Add') }}
  </v-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'

const $attrs = useAttrs()
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>