<template>
  <button v-bind="$attrs" type="submit" :disabled="isSubmitting">
    <slot name="default">
      {{ isSubmitting ? t('Submitting...') : t('Submit') }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { formStateKey } from '../constants/symbols'
import { FormController } from '@'
import { useTranslation } from '../utils/useTranslation'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormController
const { isSubmitting } = formState
const { t } = useTranslation()
</script>
