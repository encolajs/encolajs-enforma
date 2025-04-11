<template>
  <Button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    type="submit"
    :disabled="isSubmitting"
  >
    {{ isSubmitting ? t('Submitting...') : t('Submit') }}
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