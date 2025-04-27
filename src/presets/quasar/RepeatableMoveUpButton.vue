<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.moveUp'))"
    round
    size="sm"
    icon="arrow_upward"
    color="info"
  />
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'
import { QBtn } from 'quasar'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>
