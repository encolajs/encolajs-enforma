<template>
  <span v-if="count > 0">
    <span aria-hidden="true">{{ count }}</span>
    <span :style="visuallyHidden">{{ errorCountText(t, count) }}</span>
  </span>
</template>

<script setup lang="ts">
// How many errors a tab or a collapsible holds: the count, which screen readers hear as
// "2 errors". Nothing while there are none
import { useTranslation } from '@/utils/useTranslation'
import { errorCountText, visuallyHidden } from '@/utils/errorCountText'

defineOptions({ name: 'EnformaErrorBadge' })

defineProps<{
  /** How many errors */
  count: number
}>()

const { t } = useTranslation()
</script>
