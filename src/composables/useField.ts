import { computed, onMounted, onBeforeUnmount, ComputedRef } from 'vue'
// Make sure the path is correct - adjust if needed based on your file structure
import {
  FormStateReturn,
  FieldOptions,
  FieldReturn,
  EventTrigger,
} from '../types'

/**
 * Composable for managing a single form field
 *
 * @param name - Field name/path
 * @param formState - Form state from useFormState
 * @param options - Configuration options
 * @returns Field state and methods
 */
export function useField(
  name: string,
  formState: FormStateReturn,
  options: FieldOptions = {}
): ComputedRef<FieldReturn> {
  if (!name) {
    throw new Error('Field name is required')
  }

  if (!formState) {
    throw new Error('Form state is required')
  }

  const fieldState = formState.getField(name) || formState.registerField(name)

  // Keep track of field ID for re-registration
  const fieldId = fieldState?.id

  // Register with existing ID
  onMounted(() => {
    formState.registerField(name, fieldId)
  })

  // Unregister path
  onBeforeUnmount(() => {
    formState.unregisterField(name)
  })

  // Validate on mount if requested
  onMounted(() => {
    if (options.validateOnMount) {
      validate()
    }
  })

  /**
   * Handle value changes
   * @param value - New field value
   * @param trigger - Event that triggered the change ('input', 'change', 'blur')
   */
  function handleChange(value: any, trigger: EventTrigger = 'input'): void {
    formState.setFieldValue(name, value, trigger)
    if (
      (trigger === 'change' && options.validateOn === 'change') ||
      (fieldState.isDirty && fieldState.isTouched)
    ) {
      validate()
    }
  }

  /**
   * Handle blur events
   */
  function handleBlur(): void {
    fieldState.isFocused = false
    formState.touchField(name)
    formState.setFieldValue(name, fieldState.value, 'blur')
    if (fieldState.isDirty || options.validateOn === 'blur') {
      validate()
    }
  }

  /**
   * Validate the field
   * @returns Whether the field is valid
   */
  async function validate(): Promise<boolean> {
    return await formState.validateField(name)
  }

  /**
   * Reset the field to its initial state
   */
  function reset(): void {
    const originalValue = formState.getFieldValue(name)
    handleChange(originalValue)
    fieldState.isDirty = false
    fieldState.isTouched = false
  }

  const handleFocus = () => {
    fieldState.isFocused = true
  }

  const events = {
    input: (e: any) => {
      handleChange(e?.value || (e.target as HTMLInputElement)?.value, 'input')
    },
    change: (e: any) => {
      handleChange(e?.value || (e.target as HTMLInputElement)?.value, 'change')
    },
    blur: handleBlur,
    focus: handleFocus,
  }

  // Create exported API object with all field state and methods
  return computed(() => ({
    // Field value and state
    value: formState.getFieldValue(name),
    error: fieldState.error,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isValidating: fieldState.isValidating,
    isVisited: fieldState.isVisited,
    isFocused: fieldState.isFocused,

    // Methods
    validate,
    reset,

    // HTML binding helpers
    attrs: {
      value: fieldState.value,

      'aria-invalid': !!fieldState.error,
      ...(fieldState.error
        ? { 'aria-errormessage': `error-${fieldState.id}` }
        : {}),
    },
    events,

    // For arrays and custom field types
    name,
    id: fieldState.id,
  }))
}
