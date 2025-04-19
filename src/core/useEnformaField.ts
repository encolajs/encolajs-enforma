// src/core/useEnformaField.ts
import { computed, inject, mergeProps, onBeforeUnmount } from 'vue'
import { formStateKey, formSchemaKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FormController } from '@/types'
import { useTranslation } from '@/utils/useTranslation'
import { fieldValidateOnOption, useField } from '@/headless/useField'
import { FieldSchema } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'

// Define the props interface
export interface EnformaFieldProps {
  name: string
  label?: string | null
  component?: string | object | null
  placeholder?: string | null
  hideLabel?: boolean | undefined
  showLabelNextToInput?: boolean | undefined
  required?: boolean | undefined
  help?: string | null
  if?: boolean | null
  labelProps?: Record<string, any>
  errorProps?: Record<string, any>
  helpProps?: Record<string, any>
  wrapperProps?: Record<string, any>
  inputProps?: Record<string, any>
  validateOn?: string | null
  section?: string | null
  position?: number | null
}

export function useEnformaField(originalProps: EnformaFieldProps) {
  // Get injected dependencies
  const formState = inject<FormController>(formStateKey) as FormController
  const { formConfig, getConfig } = useFormConfig()
  const schema = inject<Record<string, FieldSchema>>(formSchemaKey)

  // Validate form context
  if (!formState) {
    console.error(
      `EnformaField '${originalProps.name}' must be used within a Enforma form component`
    )
  }

  // Get field schema if available
  const fieldSchema = computed((): FieldSchema | null => {
    if (!schema) return null
    return schema[originalProps.name]
  })

  // Merge props with schema and defaults
  const fieldOptions = computed(() => {
    // Default values that will be used if neither props nor schema provide a value
    const defaults: Record<string, any> = {
      component: 'input',
      hideLabel: false,
      showLabelNextToInput: false,
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
        component: fieldSchema.value.component ?? result.component,
        placeholder: fieldSchema.value.placeholder ?? null,
        hideLabel: fieldSchema.value.hideLabel ?? result.hideLabel,
        showLabelNextToInput: fieldSchema.value.showLabelNextToInput ?? result.showLabelNextToInput,
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
      component: originalProps.component ?? result.type,
      placeholder: originalProps.placeholder ?? result.placeholder,
      hideLabel: originalProps.hideLabel ?? result.hideLabel,
      showLabelNextToInput: originalProps.showLabelNextToInput ?? result.showLabelNextToInput,
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

  // Initialize field with useField composable
  const field = useField(fieldOptions.value.name, formState, {
    validateOn: fieldOptions.value.validateOn as fieldValidateOnOption,
  })

  // Set up cleanup
  onBeforeUnmount(() => {
    formState?.removeField(fieldOptions.value.name)
  })

  // Get utilities
  const { evaluateProps, evaluateCondition } = useDynamicProps()
  const { t } = useTranslation()

  // Derive computed values
  const fieldState = computed(() => field.value)
  const fieldId = computed(() => fieldState.value.id)
  const errorMessage = computed(() => fieldState.value.error)
  const requiredIndicator = getConfig('pt.required.text', '*')

  // Compute all field properties with proper merging
  const props = computed(() => {
    const result: Record<string, any> = {}

    // Wrapper props
    result.wrapper = evaluateProps(
      mergeProps(
        {
          id: `wrapper-${fieldId.value}`,
        },
        fieldOptions.value.wrapperProps || {},
        getConfig('pt.wrapper', {}) as Record<string, unknown>,
        errorMessage.value
          ? (getConfig('pt.wrapper__invalid', {}) as Record<string, unknown>)
          : {},
        fieldOptions.value.required
          ? (getConfig('pt.wrapper__required', {}) as Record<string, unknown>)
          : {}
      )
    )

    // Label props
    result.label = evaluateProps(
      mergeProps(
        {
          for: fieldId.value,
        },
        fieldOptions.value.labelProps || {},
        getConfig('pt.label', {}) as Record<string, unknown>
      )
    )

    // Required indicator
    result.required = originalProps.required
    result.requiredProps = getConfig('pt.required')

    // Help text
    result.help = evaluateProps(
      mergeProps(
        {
          id: `help-${fieldId.value}`,
        },
        fieldOptions.value.helpProps || {},
        getConfig('pt.help', {}) as Record<string, unknown>
      )
    )

    // Error message
    result.error = evaluateProps(
      mergeProps(
        {
          id: `error-${fieldId.value}`,
        },
        fieldOptions.value.errorProps || {},
        getConfig('pt.error', {}) as Record<string, unknown>
      )
    )

    // Input props
    result.input = evaluateProps(
      mergeProps(
        {
          id: fieldId.value,
          value: fieldState.value.value,
          name: fieldOptions.value.name,
          placeholder: t(fieldOptions.value.placeholder),
          invalid: !!errorMessage.value,
        },
        fieldState.value.attrs || {},
        fieldOptions.value.inputProps || {},
        getConfig('pt.input', {}) as Record<string, unknown>
      )
    )

    result.if = evaluateCondition(fieldOptions.value.if).value

    // Component type
    result.component = fieldOptions.value.component || 'input'
    result.hideLabel = fieldOptions.value.hideLabel
    result.showLabelNextToInput = fieldOptions.value.showLabelNextToInput

    // Apply custom transformers if defined in config
    return applyTransformers(
      getConfig('transformers.field_props', []) as Function[],
      result,
      field,
      formState,
      formConfig
    )
  })

  return {
    fieldOptions,
    fieldState,
    errorMessage,
    requiredIndicator,
    props,
    t,
  }
}
