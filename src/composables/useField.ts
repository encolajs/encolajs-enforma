import { computed, onMounted, onBeforeUnmount } from 'vue'
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
): FieldReturn {
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
  }

  /**
   * Handle blur events
   */
  function handleBlur(): void {
    fieldState.isFocused = false
    formState.touchField(name)
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

  // Generate attrs for easy binding to input elements
  const attrs = computed((): Record<string, any> => {
    return {
      value: fieldState.value,
      onInput: (e: Event) =>
        handleChange((e.target as HTMLInputElement)?.value || e, 'input'),
      onChange: (e: Event) =>
        handleChange((e.target as HTMLInputElement)?.value || e, 'change'),
      onBlur: handleBlur,
      'aria-invalid': !!fieldState.error,
      ...(fieldState.error
        ? { 'aria-errormessage': `error-${name.replace(/[\[\]\.]/g, '-')}` }
        : {}),
    }
  })

  const handleFocus = () => {
    fieldState.isFocused = true
  }

  // Create exported API object with all field state and methods
  return {
    // Field value and state
    value: computed(() => fieldState.value),
    error: computed(() => fieldState.error),
    isDirty: computed(() => fieldState.isDirty),
    isTouched: computed(() => fieldState.isTouched),
    isValidating: computed(() => fieldState.isValidating),
    isVisited: computed(() => fieldState.isVisited),
    isFocused: computed(() => fieldState.isFocused),

    // Event handlers
    handleChange,
    handleBlur,
    handleFocus,

    // Methods
    validate,
    reset,

    // HTML binding helpers
    attrs,

    // For arrays and custom field types
    name,
  }
}
