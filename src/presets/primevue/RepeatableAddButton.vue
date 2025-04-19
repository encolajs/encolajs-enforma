<template>
  <Button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.repeatableAddButton'))"
    type="button"
    severity="secondary"
    icon="pi pi-plus"
    :label="t('Add')"
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
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
