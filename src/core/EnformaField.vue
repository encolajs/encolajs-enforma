<template>
  <div v-bind="{ ...filteredAttrs, ...props.wrapperProps }">
    <label
      v-if="!props.hideLabel && !props.showLabelNextToInput && props.label"
      v-bind="props.labelProps"
    >
      {{ t(props.label) }}
      <span v-if="props.required" v-bind="props.requiredProps">
        {{ requiredIndicator }}
      </span>
    </label>

    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents || {}"
      />
      <label
        v-if="props.showLabelNextToInput && props.label"
        v-bind="props.labelProps"
      >
        {{ t(props.label) }}
        <span v-if="props.required" v-bind="props.requiredProps">
          {{ requiredIndicator }}
        </span>
      </label>
    </div>

    <!-- Help text -->
    <div v-if="props.help" class="enforma-field-help" v-bind="props.helpProps">
      {{ t(props.help) }}
    </div>

    <!-- Error message -->
    <div
      v-if="fieldController.error"
      class="enforma-field-error"
      v-bind="props.errorProps"
    >
      {{ fieldController.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { EnformaFieldProps, useEnformaField } from './useEnformaField'
import { ComponentPublicInstance, PropType, useAttrs, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { useFormConfig } from '@/utils/useFormConfig'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const excludedAttrs = ['type', 'rules', 'messages']
const filteredAttrs = computed(() => {
  return Object.keys(attrs)
    .filter((k) => !excludedAttrs.includes(k))
    .reduce((acc, k) => {
      acc[k] = attrs[k]
      return acc
    }, {})
})

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: {
    type: [String, Object] as unknown as PropType<
      string | ComponentPublicInstance | null
    >,
    default: null,
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  useModelValue: { type: Boolean, default: false },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // these are here only because they might be passed from the schema
  // they are not actually used for rendering
  section: { type: String, default: null },
  position: { type: Number, default: null },
}) as EnformaFieldProps
// Use the extracted composable
const { fieldController, props } = useEnformaField(originalProps)
// Import translation function directly
const { t } = useTranslation()
// Get the required indicator directly
const { getConfig } = useFormConfig()
const requiredIndicator = getConfig('pt.required.text', '*')
</script>
