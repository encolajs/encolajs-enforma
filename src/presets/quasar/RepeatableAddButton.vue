<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.add'))"
    round
    size="sm"
    icon="add"
    color="positive"
  />
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { mergeProps, useAttrs } from 'vue'
import { QBtn } from 'quasar'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>