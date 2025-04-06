<template>
  <div v-bind="props.wrapper" v-show="visible">
    <label v-if="!hideLabel" v-bind="props.label">
      {{ t(label) }}
      <span v-if="required" v-bind="props.required">{{
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
    <div v-if="help" v-bind="props.help">
      {{ t(help) }}
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" v-bind="props.error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, mergeProps, onBeforeUnmount } from 'vue'
import { formConfigKey, formStateKey } from '../../constants/symbols'
import { FormKitConfig } from '../../types/config'
import { useDynamicProps } from '../../composables/useDynamicProps'
import { FormProxy } from '../../index'
import { useTranslation } from '../../composables/useTranslation'
import { useField } from '../../composables/useField'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  type: { type: String, default: 'input' },
  placeholder: { type: String, default: null },
  hideLabel: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  help: { type: String, default: null },
  visible: { type: Boolean, default: true },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  wrapperProps: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  validateOn: { type: String, default: null },
})

// Get form state from context
const formState = inject<FormProxy>(formStateKey) as FormProxy
const config = inject<FormKitConfig>(formConfigKey) as FormKitConfig

if (!formState) {
  console.error(
    `FormKitField '${originalProps.name}' must be used within a FormKit form component`
  )
}

// Use the useField composable directly instead of via HeadlessField
const field = useField(originalProps.name, formState, {
  validateOn: originalProps.validateOn,
})

// Clean up on unmount
onBeforeUnmount(() => {
  formState?.removeField(originalProps.name)
})

// Extract the field state from the computed ref
const fieldState = computed(() => field.value)

const { evaluateProps } = useDynamicProps()
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
    originalProps.required ? 'formkit-required' : '',
  ].filter(Boolean)

  // Wrapper props
  result.wrapper = evaluateProps(
    mergeProps(
      {
        id: `wrapper-${fieldId.value}`,
        class: classes,
      },
      originalProps.wrapperProps || {},
      config.pt.wrapper || {}
    )
  )

  // Label props
  result.label = evaluateProps(
    mergeProps(
      {
        for: fieldId.value,
      },
      originalProps.labelProps || {},
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
      originalProps.helpProps || {},
      config.pt.help || {}
    )
  )

  // Error message
  result.error = evaluateProps(
    mergeProps(
      {
        id: `error-${fieldId.value}`,
      },
      originalProps.errorProps || {},
      config.pt.error || {}
    )
  )

  // Input props
  result.input = evaluateProps(
    mergeProps(
      {
        id: fieldId.value,
        value: fieldState.value.value,
        name: originalProps.name,
        placeholder: t(originalProps.placeholder),
        invalid: !!errorMessage.value,
      },
      fieldState.value.attrs || {},
      originalProps.inputProps || {},
      config.pt.input || {}
    )
  )

  // Component type
  result.component = originalProps.type || 'input'

  // Apply custom transformers if defined in config
  return (config.field_props_transformers || []).reduce(
    (result: any, transformer: Function) => {
      return transformer(result, field, formState, config)
    },
    result
  )
})
</script>
