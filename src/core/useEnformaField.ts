// src/core/useEnformaField.ts
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  ComponentPublicInstance,
  ComputedRef,
} from 'vue'
import { formControllerKey, formSchemaKey } from '@/constants/symbols'
import { FormController } from '@/types'
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
  useModelValue?: boolean | undefined
  labelProps?: Record<string, any>
  requiredProps?: Record<string, any>
  errorProps?: Record<string, any>
  helpProps?: Record<string, any>
  props?: Record<string, any>
  inputProps?: Record<string, any>
  section?: string | null
  position?: number | null
}

// retrieve the field props by combining:
// defaults, props from schema and props from the EnformaField component
function getFieldProps<T>(
  schema: Record<string, FieldSchema> | null,
  originalProps: EnformaFieldProps,
  getConfig: <T = any>(path: string, defaultValue?: T) => T | null | undefined
) {
  // Get field schema if available
  const fieldSchema = schema ? schema[originalProps.name] : null

  const defaults: Record<string, any> = {
    component: 'input',
    inputComponent: null,
    hideLabel: false,
    showLabelNextToInput: false,
    required: false,
    useModelValue: false,
    labelProps: {},
    requiredProps: getConfig('pt.required'),
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
  if (fieldSchema) {
    result = {
      ...result,
      label: fieldSchema.label ?? null,
      component: fieldSchema.component ?? result.component,
      inputComponent: fieldSchema.inputComponent ?? result.component,
      hideLabel: fieldSchema.hideLabel ?? result.hideLabel,
      showLabelNextToInput:
        fieldSchema.showLabelNextToInput ?? result.showLabelNextToInput,
      required: fieldSchema.required ?? result.required,
      useModelValue: fieldSchema.useModelValue ?? result.useModelValue,
      help: fieldSchema.help ?? null,
      labelProps: { ...result.labelProps, ...fieldSchema.labelProps },
      requiredProps: {
        ...result.requiredProps,
        ...fieldSchema.requiredProps,
      },
      errorProps: { ...result.errorProps, ...fieldSchema.errorProps },
      helpProps: { ...result.helpProps, ...fieldSchema.helpProps },
      props: { ...result.props, ...fieldSchema.props },
      inputProps: { ...result.inputProps, ...fieldSchema.inputProps },
      section: fieldSchema.section ?? null,
      position: fieldSchema.position ?? null,
    }
    console.log(result.inputProps)
    console.log(fieldSchema)
    console.log({ ...result.inputProps, ...fieldSchema.inputProps })
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
    useModelValue: originalProps.useModelValue ?? result.useModelValue,
    help: originalProps.help ?? result.help,
    labelProps: { ...result.labelProps, ...originalProps.labelProps },
    requiredProps: {
      ...result.requiredProps,
      ...originalProps.requiredProps,
    },
    errorProps: { ...result.errorProps, ...originalProps.errorProps },
    helpProps: { ...result.helpProps, ...originalProps.helpProps },
    props: { ...result.props, ...originalProps.props },
    inputProps: { ...result.inputProps, ...originalProps.inputProps },
    section: originalProps.section ?? result.section,
    position: originalProps.position ?? result.position,
  }

  return result
}

// return fieldController and props
export function useEnformaField(originalProps: EnformaFieldProps) {
  // Get injected dependencies
  const formState = inject<FormController>(formControllerKey) as FormController

  // Validate form context
  if (!formState) {
    console.error(
      `[Enforma] EnformaField '${originalProps.name}' must be used within a Enforma form component`
    )
  }

  const { formConfig, getConfig } = useFormConfig()
  const schema = inject<Record<string, FieldSchema> | null>(formSchemaKey, null)
  const options = getFieldProps(schema, originalProps, getConfig)

  // Initialize field with useField composable
  const fieldController = useField(options.name, formState, {})

  // Set up cleanup
  onBeforeUnmount(() => {
    formState?.removeField(options.name)
  })

  // First, apply transformers to the field options
  const transformedFieldOptions: ComputedRef<EnformaFieldProps> = computed(
    () => {
      // Apply field props transformers if defined in config
      const fieldPropsTransformers = getConfig(
        'transformers.field_props',
        []
      ) as Function[]

      // Create inputEvents by copying the fieldController.events
      options.inputEvents = { ...fieldController.value.events }

      // Handle useModelValue prop for components that only use update:modelValue
      if (options.useModelValue) {
        const fieldName = options.name

        // Remove input and change events
        delete options.inputEvents.input
        delete options.inputEvents.change

        // Add update:modelValue event handler
        options.inputEvents['update:modelValue'] = (value: any) => {
          formState.setFieldValue(
            fieldName,
            value,
            formState.getField(fieldName).$isDirty.value,
            {
              $isDirty: true,
            }
          )
        }
      }

      if (fieldPropsTransformers.length === 0) {
        return options
      }

      return applyTransformers(
        fieldPropsTransformers,
        { ...options },
        fieldController,
        formState,
        formConfig
      )
    }
  )

  // Derive computed values
  const fieldId = computed(
    () =>
      transformedFieldOptions.value.inputProps?.id || fieldController.value.id
  )

  // Combine all props into a single computed property
  const props = computed(() => {
    // Get all the original props after transformation
    const transformedProps = { ...transformedFieldOptions.value }

    // Get a reference to the transformed input props to determine if an ID was already provided
    const transformedInputProps = transformedProps.inputProps || {}

    // Create wrapper props
    const wrapperProps = mergeProps(
      {
        id: `wrapper-${fieldId.value}`,
      },
      transformedProps.props || {},
      getConfig('pt.wrapper', {}) as Record<string, unknown>,
      fieldController.value.error
        ? (getConfig('pt.wrapper__invalid', {}) as Record<string, unknown>)
        : {},
      transformedProps.required
        ? (getConfig('pt.wrapper__required', {}) as Record<string, unknown>)
        : {}
    )

    // Compute label props
    const labelProps = mergeProps(
      {
        for: fieldId.value,
      },
      transformedProps.labelProps || {},
      getConfig('pt.label', {}) as Record<string, unknown>
    )

    // Help text props
    const helpProps = mergeProps(
      {
        id: `help-${fieldId.value}`,
      },
      transformedProps.helpProps || {},
      getConfig('pt.help', {}) as Record<string, unknown>
    )

    // Error message props
    const errorProps = mergeProps(
      {
        id: `error-${fieldId.value}`,
      },
      transformedProps.errorProps || {},
      getConfig('pt.error', {}) as Record<string, unknown>
    )

    // Input props
    const defaultInputProps: Record<string, any> = {
      value: fieldController.value.value,
      name: transformedProps.name,
      invalid: !!fieldController.value.error,
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

    // Return all combined props
    return {
      ...transformedProps, // All original props after transformation
      inputComponent: transformedProps.inputComponent || 'input', // Ensure inputComponent is set
      wrapperProps, // Props for the wrapper element
      labelProps, // Props for the label element
      helpProps, // Props for the help text
      errorProps, // Props for the error message
      inputProps, // Props for the input element
    }
  })

  return {
    fieldController,
    props,
  }
}
