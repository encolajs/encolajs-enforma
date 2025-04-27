<template>
  <div v-bind="props.wrapper">
    <label
      v-if="
        !props.hideLabel && !props.showLabelNextToInput && fieldOptions.label
      "
      v-bind="props.label"
    >
      {{ t(fieldOptions.label) }}
      <span v-if="props.required" v-bind="props.requiredProps">
        {{ requiredIndicator }}
      </span>
    </label>

    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.input"
        v-on="fieldController.events"
      />
      <label
        v-if="props.showLabelNextToInput && fieldOptions.label"
        v-bind="props.label"
      >
        {{ t(fieldOptions.label) }}
        <span v-if="props.required" v-bind="props.requiredProps">
          {{ requiredIndicator }}
        </span>
      </label>
    </div>

    <!-- Help text -->
    <div
      v-if="fieldOptions.help"
      class="enforma-field-help"
      v-bind="props.help"
    >
      {{ t(fieldOptions.help) }}
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="enforma-field-error" v-bind="props.error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { EnformaFieldProps, useEnformaField } from './useEnformaField'
import { ComponentPublicInstance, PropType } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { useFormConfig } from '@/utils/useFormConfig'

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
const {
  fieldOptions,
  fieldController,
  errorMessage,
  props,
} = useEnformaField(originalProps)
// Import translation function directly
const { t } = useTranslation()
// Get the required indicator directly
const { getConfig } = useFormConfig()
const requiredIndicator = getConfig('pt.required.text', '*')
</script>
