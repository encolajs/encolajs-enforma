<template>
  <component
    :is="effectiveComponent"
    v-bind="mergeProps($attrs, getConfig('pt.reset'))"
    type="reset"
    :disabled="$isSubmitting"
    @click.prevent="reset"
  >
    <slot name="default">
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
const { getConfig } = useFormConfig()

const effectiveComponent = getConfig('pt.reset.as') || props.as

const effectiveContent = getConfig('pt.reset.content')
</script>
