// src/core/useEnformaField.ts
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  ComponentPublicInstance,
  ComputedRef,
  ref,
  watchEffect,
} from 'vue'
import {
  formContextKey,
  formControllerKey,
  formSchemaKey,
  fieldRulesCollectorKey,
} from '@/constants/symbols'
import { FormController, FormSchema } from '@/types'
import { useField } from '@/headless/useField'
import { FieldSchema } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import applyTransformers from '@/utils/applyTransformers'
import { evaluateSchema } from '@/utils/evaluateSchema'
import isNonEmptyObject from '@/utils/isNonEmptyObject'

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
  errorProps?: Record<string, any>
  helpProps?: Record<string, any>
  props?: Record<string, any>
  inputProps?: Record<string, any>
  section?: string | null
  position?: number | null
  rules?: string | null
  messages?: Record<string, any> | null
}

// retrieve the field props by combining:
// defaults, props from schema and props from the EnformaField component
function getFieldProps<T>(
  originalProps: EnformaFieldProps,
  schema: FormSchema | null,
  formCtrl: FormController,
  getConfig: <T = any>(path: string, defaultValue?: T) => T | null | undefined
) {
  // Get field schema if available
  const fieldSchema = (
    schema ? schema[originalProps.name] : null
  ) as FieldSchema
  formCtrl.getFieldValue(originalProps.name)

  const defaults: Record<string, any> = {
    inputComponent: null,
    hideLabel: false,
    showLabelNextToInput: false,
    required: false,
    useModelValue: false,
    labelProps: {},
    errorProps: {},
    helpProps: {},
    props: {},
    inputProps: {},
    label: null,
    help: null,
  }

  // Start with defaults
  let result = { ...defaults }

  // Apply schema values if available
  if (fieldSchema) {
    result = {
      ...result,
      ...fieldSchema,
    }
    // not needed at this point
    delete result.section
    delete result.type
    delete result.position
  }

  // Apply component props (these take precedence over schema and defaults)
  Object.entries(originalProps).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      (typeof value !== 'object' || isNonEmptyObject(value))
    ) {
      result[key] = value
    }
  })

  return result
}

// return fieldController and props
export function useEnformaField(originalProps: EnformaFieldProps) {
  // Get injected dependencies
  const formCtrl = inject<FormController>(formControllerKey) as FormController
  const schema = inject<FormSchema>(formSchemaKey, {})
  const formContext = inject<any>(formContextKey)
  const fieldRulesCollector = inject<any>(fieldRulesCollectorKey, null)
  const { formConfig, getConfig } = useFormConfig()

  // Validate form context
  if (!formCtrl) {
    console.error(
      `[Enforma] EnformaField '${originalProps.name}' must be used within a Enforma form component`
    )
  }

  const internalState = ref(0)

  // Replace event listener with watchEffect for automatic dependency tracking
  watchEffect(() => {
    // Automatically track relevant form state changes
    const fieldValue = formCtrl[originalProps.name]
    const fieldErrors = formCtrl[`${originalProps.name}.$errors`]
    const fieldState = {
      isDirty: formCtrl[`${originalProps.name}.$isDirty`]?.value,
      isTouched: formCtrl[`${originalProps.name}.$isTouched`]?.value,
      isValidating: formCtrl[`${originalProps.name}.$isValidating`]?.value,
    }

    // Increment state to trigger re-computation when any tracked property changes
    internalState.value++
  })

  const fieldProps = computed(() => {
    return evaluateSchema(
      getFieldProps(originalProps, schema, formCtrl, getConfig),
      formCtrl,
      formContext,
      formConfig
    )
  })

  // Initialize field with useField composable
  const fieldController = useField(fieldProps.value.name, formCtrl, {})

  // Register field rules and messages with parent form if collector is available
  if (fieldRulesCollector && (originalProps.rules || originalProps.messages)) {
    fieldRulesCollector.registerField(
      originalProps.name,
      originalProps.rules,
      originalProps.messages
    )
  }

  // Set up cleanup
  onBeforeUnmount(() => {
    formCtrl?.removeField(fieldProps.value.name)
    // Unregister field rules and messages
    if (fieldRulesCollector) {
      fieldRulesCollector.unregisterField(originalProps.name)
    }
  })

  // First, apply transformers to the field options
  const transformedFieldProps: ComputedRef<EnformaFieldProps> = computed(() => {
    // Apply field props transformers if defined in config
    const fieldPropsTransformers = getConfig(
      'transformers.field_props',
      []
    ) as Function[]

    const props = fieldProps.value

    // Create inputEvents by copying the fieldController.events
    props.inputEvents = { ...fieldController.value.events }

    // Handle useModelValue prop for components that only use update:modelValue
    if (props.useModelValue) {
      const fieldName = props.name

      // Remove input and change events
      delete props.inputEvents.input
      delete props.inputEvents.change

      // Add update:modelValue event handler
      props.inputEvents['update:modelValue'] = (value: any) => {
        formCtrl.setFieldValue(
          fieldName,
          value,
          formCtrl.getField(fieldName).$isDirty.value,
          {
            $isDirty: true,
          }
        )
      }
    }

    if (fieldPropsTransformers.length === 0) {
      return props
    }

    return applyTransformers(
      fieldPropsTransformers,
      { ...props },
      fieldController,
      formCtrl,
      formConfig
    )
  })

  // Derive computed values
  const fieldId = computed(
    () => transformedFieldProps.value.inputProps?.id || fieldController.value.id
  )

  // Combine all props into a single computed property
  const props = computed(() => {
    const state = internalState.value // to trigger update
    // Get all the original props after transformation
    const transformedProps = { ...transformedFieldProps.value }

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
        id: `label-${fieldId.value}`,
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
      {
        'aria-required': !!originalProps.required,
        'aria-readonly': !!transformedInputProps.readonly,
        'aria-disabled': !!transformedInputProps.disabled,
      },
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
