<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getConfig('pt.submit'))"
    type="submit"
    :disabled="$isSubmitting"
    :loading="$isSubmitting"
  >
    <slot name="default">
      <span
        v-html="
          $isSubmitting ? t(effectiveLoadingContent) : t(effectiveContent)
        "
      ></span>
    </slot>
  </component>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'

interface Props {
  content?: string
  loadingContent?: string
  as?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Submit',
  loadingContent: 'Submitting...',
  as: 'button',
})

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveComponent = getConfig('pt.submit.as') || props.as

const effectiveContent = getConfig('pt.submit.content')

const effectiveLoadingContent = getConfig('pt.submit.loadingContent')
</script>
