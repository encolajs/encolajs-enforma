<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.reset'))"
    type="reset"
    :disable="$isSubmitting"
    outline
    color="secondary"
  >
    {{ t('Reset') }}
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
