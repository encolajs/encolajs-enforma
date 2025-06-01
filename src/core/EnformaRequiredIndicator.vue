<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getConfig('pt.required'))"
  >
    <span v-html="effectiveContent"></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useTranslation } from '@/utils/useTranslation'
import { mergeProps } from 'vue'

interface Props {
  content?: string
  as?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  content: '*',
  as: 'span',
})

const { getConfig } = useFormConfig()
const { t } = useTranslation()

const effectiveComponent = getConfig('pt.required.as') || props.as

const effectiveContent = computed(() => {
  const configContent = getConfig('pt.required.content')
  const content = configContent !== undefined ? configContent : props.content
  return t(content)
})
</script>
