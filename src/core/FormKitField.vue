<!-- src/core/FormKitField.vue -->
<template>
  <div
    :class="getConfig('classes.field.wrapper')"
    v-bind="props.wrapper"
    v-show="props.if"
  >
    <label
      v-if="!props.hideLabel"
      :class="getConfig('classes.field.label')"
      v-bind="props.label"
    >
      {{ t(fieldOptions.label) }}
      <span v-if="props.required" :class="getConfig('classes.field.required')">
        {{ requiredIndicator }}
      </span>
    </label>

    <!-- Field content slot -->
    <slot name="default" v-bind="{ ...fieldState, attrs: props.input }">
      <component
        :is="props.component"
        :class="getConfig('classes.field.input')"
        v-bind="props.input"
        v-on="fieldState.events"
      />
    </slot>

    <!-- Help text -->
    <div
      v-if="fieldOptions.help"
      :class="getConfig('classes.field.help')"
      v-bind="props.help"
    >
      {{ t(fieldOptions.help) }}
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      :class="getConfig('classes.field.error')"
      v-bind="props.error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormKitField } from './useFormKitField'
import { useFormConfig } from '@/utils/useFormConfig'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  type: { type: String, default: null },
  placeholder: { type: String, default: null },
  hideLabel: { type: Boolean, default: null },
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
  useFormKitField(originalProps)

// Get the form configuration
const { getConfig } = useFormConfig()
</script>
