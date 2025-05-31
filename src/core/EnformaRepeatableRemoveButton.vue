<template>
  <button
    type="button"
    v-bind="mergeProps($attrs || {}, getConfig('pt.repeatable.remove') || {})"
    @click="$emit('click')"
  >
    <span v-html="t(effectiveContent)"></span>
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'

interface Props {
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Remove',
})

defineEmits<{
  (e: 'click'): void
}>()

const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.remove.content') || props.content
})
</script>
