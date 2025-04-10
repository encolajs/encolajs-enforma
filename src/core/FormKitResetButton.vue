<template>
  <button
    v-bind="$attrs"
    type="reset"
    :disabled="isSubmitting"
    @click="reset"
    :class="getConfig('classes.buttons.reset')"
  >
    <slot name="default"> {{ t('Reset') }} </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { useTranslation } from '@/utils/useTranslation'
import { useFormConfig } from '@/utils/useFormConfig'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormController
const { reset, isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
