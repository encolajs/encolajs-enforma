<template>
  <component
    :is="effectiveComponent"
    type="button"
    v-bind="
      mergeProps($attrs || {}, getConfig('pt.repeatable.add') || {}) || {}
    "
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
  content: 'Add',
  as: 'button',
})

const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveComponent = getConfig('pt.repeatable.add.as') || props.as

const effectiveContent = getConfig('pt.repeatable.add.content')
</script>
