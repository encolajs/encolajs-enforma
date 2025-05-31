<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.add'))"
    round
    size="sm"
    :icon="effectiveContent === 'Add' ? 'add' : undefined"
    color="positive"
  >
    <span v-if="effectiveContent !== 'Add'" v-html="t(effectiveContent)"></span>
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
  content: 'Add',
})

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
const { t } = useTranslation()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.add.content') || props.content
})
</script>
