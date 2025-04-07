<template>
  <button v-bind="$attrs" type="submit" :disabled="isSubmitting">
    <slot name="default">
      {{ isSubmitting ? t('Submitting...') : t('Submit') }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { formStateKey } from '../../constants/symbols'
import { FormProxy } from '../../'
import { useTranslation } from '../../composables/useTranslation'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormProxy
const { isSubmitting } = formState
const { t } = useTranslation()
</script>
