<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getPassThroughProps('pt.reset'))"
    type="reset"
    :disabled="$isSubmitting"
    @click.prevent="reset"
  >
    <slot name="default">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="t(effectiveContent)"></span>
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
  as?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Reset',
  as: 'button',
})

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { reset, $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig, getPassThroughProps } = useFormConfig()

const effectiveComponent = getConfig('pt.reset.as') || props.as

const effectiveContent = getConfig('pt.reset.content') || props.content
</script>
