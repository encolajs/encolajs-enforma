<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.moveDown'))"
    round
    size="sm"
    :icon="effectiveContent === 'Move down' ? 'arrow_downward' : undefined"
    color="info"
  >
    <span
      v-if="effectiveContent !== 'Move down'"
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
  content: 'Move down',
})

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
const { t } = useTranslation()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.moveDown.content') || props.content
})
</script>
