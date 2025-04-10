<template>
  <button
    v-bind="$attrs"
    type="submit"
    :disabled="isSubmitting"
    :class="getConfig('classes.buttons.submit')"
  >
    <slot name="default">
      {{ isSubmitting ? t('Submitting...') : t('Submit') }}
    </slot>
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
const { isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
