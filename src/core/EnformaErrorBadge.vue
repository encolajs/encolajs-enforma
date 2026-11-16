<template>
  <component :is="as || 'span'" v-if="count > 0">
    <span aria-hidden="true">{{ count }}</span>
    <span :style="visuallyHidden">{{ errorCountText(t, count) }}</span>
  </component>
</template>

<script setup lang="ts">
// How many errors a tab or a collapsible holds: the count, which screen readers hear as
// "2 errors". Nothing while there are none. A kit draws it with its badge (`as`), given the
// count as its content and the other attributes as its props
import { type Component } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { errorCountText, visuallyHidden } from '@/utils/errorCountText'

defineOptions({ name: 'EnformaErrorBadge' })

defineProps<{
  /** How many errors */
  count: number
  /** What draws it: a kit's badge, or a tag (`span` by default) */
  as?: string | Component | null
}>()

const { t } = useTranslation()
</script>
