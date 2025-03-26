<template>
  <button v-bind="$attrs" type="reset" :disabled="isSubmitting" @click="reset">
    <slot name="default"> {{ t('Reset') }} </slot>
  </button>
</template>

<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { formStateKey } from '../../constants/symbols'
import { FormStateReturn } from '../../'
import { useTranslation } from '../../composables/useTranslation'

const $attrs = useAttrs()
const formState = inject(formStateKey) as FormStateReturn
const { reset, isSubmitting } = formState
const { t } = useTranslation()
</script>
