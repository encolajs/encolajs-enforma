<template>
  <v-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    type="submit"
    :loading="$isSubmitting"
    :disabled="$isSubmitting"
  >
    {{ $isSubmitting ? t('Submitting...') : t('Submit') }}
  </v-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { VBtn } from 'vuetify/components'

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
