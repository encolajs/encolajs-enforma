<!-- src/core/EnformaField.vue -->
<template>
  <div v-bind="props.wrapper" v-show="props.if">
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

    <!-- Field content slot -->
    <slot name="default" v-bind="{ ...fieldState, attrs: props.input }">
      <div class="enforma-field-input">
        <component
          :is="props.component"
          v-model="fieldState.value"
          v-bind="props.input"
          v-on="fieldState.events"
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
    </slot>

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
import { useEnformaField } from './useEnformaField'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  component: { type: String, default: null },
  placeholder: { type: String, default: null },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: Boolean, default: undefined },
  help: { type: String, default: null },
  if: { type: Boolean, default: null },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  wrapperProps: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  validateOn: { type: String, default: null },
  section: { type: String, default: null },
  position: { type: Number, default: null },
})
// Use the extracted composable
const { fieldOptions, fieldState, errorMessage, requiredIndicator, props, t } =
  useEnformaField(originalProps)
</script>
