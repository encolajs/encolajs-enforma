// src/core/useEnformaField.ts
import { computed, inject, mergeProps, onBeforeUnmount, ref } from 'vue'
import { formStateKey, formSchemaKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FieldController, FormController } from '@/types'
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

  // Create static props that don't depend on dynamic state
  const staticProps = computed(() => {
    const result: Record<string, any> = {}
    
    // Required indicator (doesn't change after initialization)
    result.required = originalProps.required
    result.requiredProps = getConfig('pt.required')
    
    // Component type and label visibility (don't change after initialization)
    result.component = fieldOptions.value.component || 'input'
    result.hideLabel = fieldOptions.value.hideLabel
    result.showLabelNextToInput = fieldOptions.value.showLabelNextToInput
    
    return result
  })
  
  // Create wrapper props separately
  const wrapperProps = computed(() => {
    const hasError = !!errorMessage.value
    
    return evaluateProps(
      mergeProps(
        {
          id: `wrapper-${fieldId.value}`,
        },
        fieldOptions.value.wrapperProps || {},
        getConfig('pt.wrapper', {}) as Record<string, unknown>,
        hasError
          ? (getConfig('pt.wrapper__invalid', {}) as Record<string, unknown>)
          : {},
        fieldOptions.value.required
          ? (getConfig('pt.wrapper__required', {}) as Record<string, unknown>)
          : {}
      )
    )
  })
  
  // Compute label props
  const labelProps = computed(() => {
    return evaluateProps(
      mergeProps(
        {
          for: fieldId.value,
        },
        fieldOptions.value.labelProps || {},
        getConfig('pt.label', {}) as Record<string, unknown>
      )
    )
  })
  
  // Help text props
  const helpProps = computed(() => {
    return evaluateProps(
      mergeProps(
        {
          id: `help-${fieldId.value}`,
        },
        fieldOptions.value.helpProps || {},
        getConfig('pt.help', {}) as Record<string, unknown>
      )
    )
  })
  
  // Error message props
  const errorProps = computed(() => {
    return evaluateProps(
      mergeProps(
        {
          id: `error-${fieldId.value}`,
        },
        fieldOptions.value.errorProps || {},
        getConfig('pt.error', {}) as Record<string, unknown>
      )
    )
  })
  
  // Input props (changes most frequently)
  const inputProps = computed(() => {
    // The field controller's _fieldVersion will be updated by FieldState._version
    // ensuring reactivity based on field state changes
    
    return evaluateProps(
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
  })
  
  // Compute conditional visibility
  const visibilityCondition = computed(() => {
    return evaluateCondition(fieldOptions.value.if).value
  })
  
  // Combine all props into a single computed property
  const props = computed(() => {
    const result: Record<string, any> = {
      ...staticProps.value,
      wrapper: wrapperProps.value,
      label: labelProps.value,
      help: helpProps.value,
      error: errorProps.value,
      input: inputProps.value,
      if: visibilityCondition.value
    }

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
