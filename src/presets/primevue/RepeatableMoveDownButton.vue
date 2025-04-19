<template>
  <Button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.repeatableMoveUpButton'))"
    type="button"
    severity="info"
    icon="pi pi-arrow-down"
  />
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'

const $attrs = useAttrs()
const { getConfig } = useFormConfig()
</script>
