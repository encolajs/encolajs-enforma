<template>
  <button
    type="button"
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.remove'))"
    @click="$emit('click')"
  >
    {{ t('Remove') }}
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
