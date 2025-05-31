<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs || {}, getConfig('pt.repeatable.remove') || {})"
    @click="$emit('click')"
  >
    <span v-if="effectiveContent" v-html="t(effectiveContent)"></span>
  </component>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'

interface Props {
  content?: string
  as?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Remove',
  as: 'button',
})

defineEmits<{
  (e: 'click'): void
}>()

const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveComponent = getConfig('pt.repeatable.remove.as') || props.as

const effectiveContent = getConfig('pt.repeatable.remove.content')
</script>
