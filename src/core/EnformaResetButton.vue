<template>
  <button
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.reset'))"
    type="reset"
    :disabled="isSubmitting"
    @click.prevent="reset"
  >
    <slot name="default"> {{ t('Reset') }} </slot>
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { reset, isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
