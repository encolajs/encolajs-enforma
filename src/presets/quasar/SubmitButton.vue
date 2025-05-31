<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.submit'))"
    type="submit"
    :loading="$isSubmitting"
    :disable="$isSubmitting"
    color="primary"
  >
    <span
      v-html="$isSubmitting ? t(effectiveLoadingContent) : t(effectiveContent)"
    ></span>
  </q-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { QBtn } from 'quasar'

interface Props {
  content?: string
  loadingContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Submit',
  loadingContent: 'Submitting...',
})

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.submit.content') || props.content
})

const effectiveLoadingContent = computed(() => {
  return (
    getConfig('pt.repeatable.submit.loadingContent') || props.loadingContent
  )
})
</script>
