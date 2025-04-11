<template>
  <Button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    severity="secondary"
    type="submit"
    :disabled="isSubmitting"
  >
    {{ t('Reset') }}
  </Button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormController
const { isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
