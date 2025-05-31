<template>
  <q-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.reset'))"
    type="reset"
    :disable="$isSubmitting"
    outline
    color="secondary"
  >
    <span v-html="t(effectiveContent)"></span>
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
}

const props = withDefaults(defineProps<Props>(), {
  content: 'Reset',
})

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { $isSubmitting } = formState
const { t } = useTranslation()
const { getConfig } = useFormConfig()

const effectiveContent = computed(() => {
  return getConfig('pt.repeatable.reset.content') || props.content
})
</script>
