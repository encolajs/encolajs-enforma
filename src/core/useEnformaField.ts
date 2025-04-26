// src/core/useEnformaField.ts
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  ref,
  ComponentPublicInstance, ComputedRef,
} from 'vue'
import { formControllerKey, formSchemaKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { useTranslation } from '@/utils/useTranslation'
import { useField } from '@/headless/useField'
import { FieldSchema } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'

// Define the props interface
export interface EnformaFieldProps {
  name: string
  label?: string | null
  inputComponent?: string | ComponentPublicInstance | null
  hideLabel?: boolean | undefined
  showLabelNextToInput?: boolean | undefined
  required?: boolean | string | undefined
  help?: string | null
  labelProps?: Record<string, any>
  errorProps?: Record<string, any>
  helpProps?: Record<string, any>
  props?: Record<string, any>
  inputProps?: Record<string, any>
  section?: string | null
  position?: number | null
}

export function useEnformaField(originalProps: EnformaFieldProps) {
  // Get injected dependencies
  const formState = inject<FormController>(formControllerKey) as FormController
  const { formConfig, getConfig } = useFormConfig()
  const schema = inject<Record<string, FieldSchema> | null>(formSchemaKey, null)

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
      inputComponent: null,
      hideLabel: false,
      showLabelNextToInput: false,
      required: false,
      labelProps: {},
      errorProps: {},
      helpProps: {},
      props: {},
      inputProps: {},
      label: null,
      help: null,
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
        inputComponent: fieldSchema.value.inputComponent ?? result.component,
        hideLabel: fieldSchema.value.hideLabel ?? result.hideLabel,
        showLabelNextToInput:
          fieldSchema.value.showLabelNextToInput ?? result.showLabelNextToInput,
        required: fieldSchema.value.required ?? result.required,
        help: fieldSchema.value.help ?? null,
        labelProps: { ...result.labelProps, ...fieldSchema.value.labelProps },
        errorProps: { ...result.errorProps, ...fieldSchema.value.errorProps },
        helpProps: { ...result.helpProps, ...fieldSchema.value.helpProps },
        props: { ...result.props, ...fieldSchema.value.props },
        inputProps: { ...result.inputProps, ...fieldSchema.value.inputProps },
        section: fieldSchema.value.section ?? null,
        position: fieldSchema.value.position ?? null,
      }
    }

    // Apply component props (these take precedence over schema and defaults)
    result = {
      ...result,
      name: originalProps.name,
      label: originalProps.label ?? result.label,
      component: result.component, // Keep component from schema or defaults
      inputComponent: originalProps.inputComponent ?? result.inputComponent,
      hideLabel: originalProps.hideLabel ?? result.hideLabel,
      showLabelNextToInput:
        originalProps.showLabelNextToInput ?? result.showLabelNextToInput,
      required: originalProps.required ?? result.required,
      help: originalProps.help ?? result.help,
      labelProps: { ...result.labelProps, ...originalProps.labelProps },
      errorProps: { ...result.errorProps, ...originalProps.errorProps },
      helpProps: { ...result.helpProps, ...originalProps.helpProps },
      props: { ...result.props, ...originalProps.props },
      inputProps: { ...result.inputProps, ...originalProps.inputProps },
      section: originalProps.section ?? result.section,
      position: originalProps.position ?? result.position,
    }

    return result
  })

  // Initialize field with useField composable
  const field = useField(fieldOptions.value.name, formState, {})

  // Set up cleanup
  onBeforeUnmount(() => {
    formState?.removeField(fieldOptions.value.name)
  })

  // Get utilities
  const { t } = useTranslation()

  // First, apply transformers to the field options
  const transformedFieldOptions: ComputedRef<EnformaFieldProps> = computed(() => {
    // Apply field props transformers if defined in config
    const fieldPropsTransformers = getConfig('transformers.field_props', []) as Function[]
    
    if (fieldPropsTransformers.length === 0) {
      return fieldOptions.value
    }
    
    return applyTransformers(
      fieldPropsTransformers,
      { ...fieldOptions.value },
      field,
      formState,
      formConfig
    )
  })

  // Derive computed values
  const fieldController = computed(() => field.value)
  const fieldId = computed(() => transformedFieldOptions.value.inputProps?.id || fieldController.value.id)
  const errorMessage = computed(() => fieldController.value.error)
  const requiredIndicator = getConfig('pt.required.text', '*')

  // Combine all props into a single computed property
  const props = computed(() => {
    // Create static props that don't depend on dynamic state
    const staticProps = (() => {
      const result: Record<string, any> = {}

      // Required indicator (doesn't change after initialization)
      result.required = transformedFieldOptions.value.required
      result.requiredProps = getConfig('pt.required')

      // Component type and label visibility (don't change after initialization)
      result.inputComponent = transformedFieldOptions.value.inputComponent ||
                         'input'
      result.hideLabel = transformedFieldOptions.value.hideLabel
      result.showLabelNextToInput = transformedFieldOptions.value.showLabelNextToInput

      return result
    })()

    // Get a reference to the transformed input props to determine if an ID was already provided
    const transformedInputProps = transformedFieldOptions.value.inputProps || {}
    
    // Create wrapper props separately - use transformedFieldOptions
    const wrapperProps = mergeProps(
      {
        id: `wrapper-${fieldId.value}`,
      },
      transformedFieldOptions.value.props || {},
      getConfig('pt.wrapper', {}) as Record<string, unknown>,
      errorMessage.value
        ? (getConfig('pt.wrapper__invalid', {}) as Record<string, unknown>)
        : {},
      transformedFieldOptions.value.required
        ? (getConfig('pt.wrapper__required', {}) as Record<string, unknown>)
        : {}
    )

    // Compute label props - use transformedFieldOptions
    const labelProps = mergeProps(
      {
        for: fieldId.value,
      },
      transformedFieldOptions.value.labelProps || {},
      getConfig('pt.label', {}) as Record<string, unknown>
    )

    // Help text props - use transformedFieldOptions
    const helpProps = mergeProps(
      {
        id: `help-${fieldId.value}`,
      },
      transformedFieldOptions.value.helpProps || {},
      getConfig('pt.help', {}) as Record<string, unknown>
    )

    // Error message props - use transformedFieldOptions
    const errorProps = mergeProps(
      {
        id: `error-${fieldId.value}`,
      },
      transformedFieldOptions.value.errorProps || {},
      getConfig('pt.error', {}) as Record<string, unknown>
    )

    // Input props (changes most frequently) - use transformedFieldOptions
    // Only add id if it's not already present in transformedInputProps
    const defaultInputProps: Record<string, any> = {
      value: fieldController.value.value,
      name: transformedFieldOptions.value.name,
      invalid: !!errorMessage.value,
    }
    
    // Only add id if not already provided by the transformer
    if (!transformedInputProps.id) {
      defaultInputProps.id = fieldId.value
    }
    
    const inputProps = mergeProps(
      defaultInputProps,
      fieldController.value.attrs || {},
      transformedInputProps,
      getConfig('pt.input', {}) as Record<string, unknown>
    )

    return {
      ...staticProps,
      wrapper: wrapperProps,
      label: labelProps,
      help: helpProps,
      error: errorProps,
      input: inputProps,
    }
  })

  return {
    fieldOptions,
    fieldController,
    errorMessage,
    requiredIndicator,
    props,
    t,
  }
}
