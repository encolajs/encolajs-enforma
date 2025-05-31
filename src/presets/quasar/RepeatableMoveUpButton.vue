<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.moveUp'))"
    round
    size="sm"
    :icon="effectiveContent === 'Move up' ? 'arrow_upward' : undefined"
    color="info"
  >
    <span
      v-if="effectiveContent !== 'Move up'"
      v-html="t(effectiveContent)"
    ></span>
  </q-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { QBtn } from 'quasar'

interface Props {
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Move up',
})

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
const { t } = useTranslation()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.moveUp.content') || props.content
})
</script>
