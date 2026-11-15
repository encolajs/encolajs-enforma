<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getPassThroughProps('pt.reset'))"
    type="reset"
    :disabled="!controller || isSubmitting"
    @click.prevent="controller?.reset()"
  >
    <slot name="default">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="t(effectiveContent)"></span>
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
  as?: string | object
  /**
   * The form to reset, for a button outside it: a ref to its `<Enforma>`, or its controller.
   * Without it, the form the button is in
   */
  form?: object | null
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Reset',
  as: 'button',
  form: undefined,
})

const $attrs = useAttrs()
// The button resets the form's values itself, so the browser's own reset never runs
const { controller, isSubmitting } = useButtonForm(
  () => props.form,
  'EnformaResetButton'
)
const { t } = useTranslation()
const { getConfig, getPassThroughProps } = useFormConfig()

const effectiveComponent = getConfig('pt.reset.as') || props.as

const effectiveContent = getConfig('pt.reset.content') || props.content
</script>
