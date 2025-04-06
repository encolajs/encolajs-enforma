<template>
  <HeadlessField :name="originalProps.name">
    <template #default="field">
      <div v-bind="props.wrapper" v-show="visible">
        <label v-if="!hideLabel" v-bind="props.label">
          {{ t(label) }}
          <span v-if="required" v-bind="props.required">{{
            requiredIndicator
          }}</span>
        </label>

        <!-- Field content slot -->
        <slot name="default" v-bind="{ ...field, attrs: props.input }">
          <component
            :is="props.component"
            v-bind="props.input"
            v-on="field.events"
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
  </HeadlessField>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, mergeProps } from 'vue'
import { formConfigKey, formStateKey } from '../../constants/symbols'
import { FormKitConfig } from '../../types/config'
import { useDynamicProps } from '../../composables/useDynamicProps'
import { FieldState, FormProxy } from '../../index'
import HeadlessField from '../headless/HeadlessField'
import { useTranslation } from '../../composables/useTranslation'

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
})

const formState = inject<FormProxy>(formStateKey)
const config = inject<FormKitConfig>(formConfigKey) as FormKitConfig
const field = computed(() =>
  formState?.getField(originalProps.name)
) as ComputedRef<FieldState>
const { evaluateProps } = useDynamicProps()

const { t } = useTranslation()

const fieldId = computed(() => field.value.id)

const errorMessage = computed(() => field.value.error)

const requiredIndicator = config.pt.required?.text || '*'

const props = computed(() => {
  let result = {}
  // wrapper props
  const classes = [
    errorMessage.value ? 'formkit-has-error' : '',
    originalProps.required ? 'formkit-required' : '',
  ].filter(Boolean)
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
  result.label = evaluateProps(
    mergeProps(
      {
        for: fieldId.value,
      },
      originalProps.labelProps || {},
      config.pt.label || {}
    )
  )
  result.required = config.pt.required || {}
  result.help = evaluateProps(
    mergeProps(
      {
        id: `help-${fieldId.value}`,
      },
      originalProps.helpProps || {},
      config.pt.help || {}
    )
  )
  result.error = evaluateProps(
    mergeProps(
      {
        id: `error-${fieldId.value}`,
      },
      originalProps.errorProps || {},
      config.pt.error || {}
    )
  )
  result.input = evaluateProps(
    mergeProps(
      {
        id: field.value.id,
        value: field.value.value,
        name: originalProps.name,
        placeholder: t(originalProps.placeholder),
        invalid: !!errorMessage.value,
      },
      field.value.attrs || {},
      originalProps.inputProps || {},
      config.pt.input || {}
    )
  )
  result.component = originalProps.type || 'input'

  return (config.field_props_transformers || []).reduce(
    (result, transformer) => {
      return transformer(result, field, formState, config)
    },
    result
  )
})

const defaultSlotProps = computed(() => {
  return {
    ...field.value,
    attrs: props.value.input,
  }
})
</script>
