<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    type="submit"
    :loading="$isSubmitting"
    :disable="$isSubmitting"
    color="primary"
  >
    {{ $isSubmitting ? t('Submitting...') : t('Submit') }}
  </q-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { QBtn } from 'quasar'

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
