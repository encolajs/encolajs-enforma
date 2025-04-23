<template>
  <Button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    type="submit"
    :loading="isSubmitting"
    :disabled="isSubmitting"
  >
    {{ isSubmitting ? t('Submitting...') : t('Submit') }}
  </Button>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
