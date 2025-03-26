<template>
  <button
    v-bind="$attrs"
    type="submit"
    :disabled="isSubmitting"
    @click="submit"
  >
    <slot name="default">
      {{ isSubmitting ? t('Submitting...') : t('Submit') }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { formStateKey } from '../../constants/symbols'
import { FormStateReturn } from '../../'
import { useTranslation } from '../../composables/useTranslation'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormStateReturn
const { isSubmitting, submit } = formState
const { t } = useTranslation()
</script>
