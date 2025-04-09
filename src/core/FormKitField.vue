<template>
  <div v-bind="props.wrapper" v-show="props.if">
    <label v-if="!hideLabel" v-bind="props.label">
      {{ t(mergedProps.label) }}
      <span v-if="mergedProps.required" v-bind="props.required">{{
        requiredIndicator
      }}</span>
    </label>

    <!-- Field content slot -->
    <slot name="default" v-bind="{ ...fieldState, attrs: props.input }">
      <component
        :is="props.component"
        v-bind="props.input"
        v-on="fieldState.events"
      />
    </slot>

    <!-- Help text -->
    <div v-if="mergedProps.help" v-bind="props.help">
      {{ t(mergedProps.help) }}
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" v-bind="props.error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, mergeProps, onBeforeUnmount } from 'vue'
import { formConfigKey, formStateKey, formSchemaKey } from '../constants/symbols'
import { FormKitConfig } from '../types/config'
import { useDynamicProps } from '../utils/useDynamicProps'
import { FormController } from '@'
import { useTranslation } from '../utils/useTranslation'
import { fieldValidateOnOption, useField } from '../headless/useField'
import { FieldSchema } from '../types'

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
  // these are added to be excluded from attributes
  section: { type: String, default: null },
  position: { type: Number, default: null },
})

// Get form state and schema from context
const formState = inject<FormController>(formStateKey) as FormController
const config = inject<FormKitConfig>(formConfigKey) as FormKitConfig
const schema = inject<Record<string, FieldSchema>>(formSchemaKey)

if (!formState) {
  console.error(
    `FormKitField '${originalProps.name}' must be used within a FormKit form component`
  )
}

// Get field schema if available
const fieldSchema = computed(() => {
  if (!schema) return null
  return schema[originalProps.name]
})

// Merge props with schema if available
const mergedProps = computed(() => {
  // Default values that will be used if neither props nor schema provide a value
  const defaults: Record<string, any> = {
    type: 'input',
    hideLabel: false,
    required: false,
    if: true,
    labelProps: {},
    errorProps: {},
    helpProps: {},
    wrapperProps: {},
    inputProps: {},
    label: null,
    placeholder: null,
    help: null,
    validateOn: null,
    section: null,
    position: null,
  }

  // Start with defaults
  let result = { ...defaults }

  // Apply schema values if available
  if (fieldSchema.value) {
    result = {
      ...result,
      label: fieldSchema.value.label ?? null,
      type: fieldSchema.value.type ?? result.type,
      placeholder: fieldSchema.value.placeholder ?? null,
      hideLabel: fieldSchema.value.hideLabel ?? result.hideLabel,
      required: fieldSchema.value.required ?? result.required,
      help: fieldSchema.value.help ?? null,
      if: fieldSchema.value.if ?? result.if,
      labelProps: { ...result.labelProps, ...fieldSchema.value.label_props },
      errorProps: { ...result.errorProps, ...fieldSchema.value.error_props },
      helpProps: { ...result.helpProps, ...fieldSchema.value.help_props },
      wrapperProps: { ...result.wrapperProps, ...fieldSchema.value.props },
      inputProps: { ...result.inputProps, ...fieldSchema.value.input_props },
      validateOn: fieldSchema.value.validateOn ?? null,
      section: fieldSchema.value.section ?? null,
      position: fieldSchema.value.position ?? null,
    }
  }

  // Apply component props (these take precedence over schema and defaults)
  result = {
    ...result,
    name: originalProps.name,
    label: originalProps.label ?? result.label,
    type: originalProps.type ?? result.type,
    placeholder: originalProps.placeholder ?? result.placeholder,
    hideLabel: originalProps.hideLabel ?? result.hideLabel,
    required: originalProps.required ?? result.required,
    help: originalProps.help ?? result.help,
    if: originalProps.if ?? result.if,
    labelProps: { ...result.labelProps, ...originalProps.labelProps },
    errorProps: { ...result.errorProps, ...originalProps.errorProps },
    helpProps: { ...result.helpProps, ...originalProps.helpProps },
    wrapperProps: { ...result.wrapperProps, ...originalProps.wrapperProps },
    inputProps: { ...result.inputProps, ...originalProps.inputProps },
    validateOn: originalProps.validateOn ?? result.validateOn,
    section: originalProps.section ?? result.section,
    position: originalProps.position ?? result.position,
  }

  return result
})

// Use the useField composable directly instead of via HeadlessField
const field = useField(mergedProps.value.name, formState, {
  validateOn: mergedProps.value.validateOn as fieldValidateOnOption,
})

// Clean up on unmount
onBeforeUnmount(() => {
  formState?.removeField(mergedProps.value.name)
})

// Extract the field state from the computed ref
const fieldState = computed(() => field.value)

const { evaluateProps, evaluateCondition } = useDynamicProps()
const { t } = useTranslation()

// Get computed properties
const fieldId = computed(() => fieldState.value.id)
const errorMessage = computed(() => fieldState.value.error)
const requiredIndicator = config.pt.required?.text || '*'

// Compute field properties with proper merging
const props = computed(() => {
  let result: Record<string, any> = {}
  // wrapper props
  const classes = [
    errorMessage.value ? 'formkit-has-error' : '',
    mergedProps.value.required ? 'formkit-required' : '',
  ].filter(Boolean)

  // Wrapper props
  result.wrapper = evaluateProps(
    mergeProps(
      {
        id: `wrapper-${fieldId.value}`,
        class: classes,
      },
      mergedProps.value.wrapperProps || {},
      config.pt.wrapper || {}
    )
  )

  // Label props
  result.label = evaluateProps(
    mergeProps(
      {
        for: fieldId.value,
      },
      mergedProps.value.labelProps || {},
      config.pt.label || {}
    )
  )

  // Required indicator
  result.required = config.pt.required || {}

  // Help text
  result.help = evaluateProps(
    mergeProps(
      {
        id: `help-${fieldId.value}`,
      },
      mergedProps.value.helpProps || {},
      config.pt.help || {}
    )
  )

  // Error message
  result.error = evaluateProps(
    mergeProps(
      {
        id: `error-${fieldId.value}`,
      },
      mergedProps.value.errorProps || {},
      config.pt.error || {}
    )
  )

  // Input props
  result.input = evaluateProps(
    mergeProps(
      {
        id: fieldId.value,
        value: fieldState.value.value,
        name: mergedProps.value.name,
        placeholder: t(mergedProps.value.placeholder),
        invalid: !!errorMessage.value,
      },
      fieldState.value.attrs || {},
      mergedProps.value.inputProps || {},
      config.pt.input || {}
    )
  )

  result.if = evaluateCondition(mergedProps.value.if).value

  // Component type
  result.component = mergedProps.value.type || 'input'

  // Apply custom transformers if defined in config
  return (config.field_props_transformers || []).reduce(
    (result: any, transformer: Function) => {
      return transformer(result, field, formState, config)
    },
    result
  )
})
</script>
