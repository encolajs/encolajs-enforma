<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.remove'))"
    round
    size="sm"
    icon="delete"
    color="negative"
  />
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'
import { QBtn } from 'quasar'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>