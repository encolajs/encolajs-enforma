<template>
  <button
    type="button"
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.moveDown'))"
    @click="$emit('click')"
  >
    {{ t('Move down') }}
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps } from 'vue'
import { useTranslation } from '@/utils/useTranslation'

defineEmits<{
  (e: 'click'): void
}>()

const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
