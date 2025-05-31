<template>
  <component
    :is="effectiveComponent"
    type="button"
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.moveUp'))"
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
  content: 'Move up',
  as: 'button',
})

defineEmits<{
  (e: 'click'): void
}>()

const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveComponent = getConfig('pt.repeatable.moveUp.as') || props.as

const effectiveContent = getConfig('pt.repeatable.moveUp.content')
</script>
