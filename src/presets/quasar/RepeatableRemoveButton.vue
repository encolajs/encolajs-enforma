<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.remove'))"
    round
    size="sm"
    :icon="effectiveContent === 'Remove' ? 'delete' : undefined"
    color="negative"
  >
    <span
      v-if="effectiveContent !== 'Remove'"
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
  content: 'Remove',
})

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
const { t } = useTranslation()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.remove.content') || props.content
})
</script>
