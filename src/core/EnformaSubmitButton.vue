<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getPassThroughProps('pt.submit'))"
    type="submit"
    :form="formId"
    :disabled="!controller || isSubmitting || isPending"
    :loading="isSubmitting"
    @click="checkFormOwner"
  >
    <slot name="default">
      <!-- eslint-disable vue/no-v-html -->
      <span
        v-html="isSubmitting ? t(effectiveLoadingContent) : t(effectiveContent)"
      ></span>
      <!-- eslint-enable vue/no-v-html -->
    </slot>
  </component>
</template>

<script setup lang="ts">
import { mergeProps, useAttrs } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useTranslation } from '@/utils/useTranslation'
import { useButtonForm } from './useButtonForm'

interface Props {
  content?: string
  loadingContent?: string
  as?: string | object
  /**
   * The form to submit, for a button outside it: a ref to its `<Enforma>`, or its controller.
   * Without it, the form the button is in
   */
  form?: object | null
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Submit',
  loadingContent: 'Submitting...',
  as: 'button',
  form: undefined,
})

const $attrs = useAttrs()
// The button submits through the <form> it belongs to: the one it's in, or the one named by
// its `form` attribute, so Enter in a field presses it too. It's disabled while the form waits
// for pending work (an upload), which the form won't submit before
const { controller, isSubmitting, isPending, formId, checkFormOwner } =
  useButtonForm(() => props.form, 'EnformaSubmitButton')
const { t } = useTranslation()
const { getConfig, getPassThroughProps } = useFormConfig()

const effectiveComponent = getConfig('pt.submit.as') || props.as

const effectiveContent = getConfig('pt.submit.content') || props.content

const effectiveLoadingContent =
  getConfig('pt.submit.loadingContent') || props.loadingContent
</script>
