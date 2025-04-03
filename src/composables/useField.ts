import { computed, onMounted, onBeforeUnmount, ComputedRef } from 'vue'
// Make sure the path is correct - adjust if needed based on your file structure
import {
  FormStateReturn,
  FieldOptions,
  FieldReturn,
  EventTrigger,
} from '../types'
import { debounce } from '../utils/debounce'

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
      debouncedValidate()
    }
  }

  /**
   * Handle blur events
   */
  function handleBlur(): void {
    fieldState.isFocused = false
    formState.touchField(name)
    if (options.validateOn === 'blur') {
      debouncedValidate()
    }
  }

  /**
   * Validate the field
   * @returns Whether the field is valid
   */
  async function validate() {
    return await formState.validateField(name)
  }

  const debouncedValidate = debounce(validate, 200)

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

  // Register with existing ID
  onMounted(() => {
    formState.registerField(name, fieldId)
    if (options.validateOnMount) {
      validate()
    }
  })

  // Unregister path
  onBeforeUnmount(() => {
    formState.unregisterField(name)
  })

  // Create exported API object with all field state and methods
  return computed(() => {
    const value = formState.getFieldValue(name)

    return {
      // Field value and state
      value,
      error: fieldState.error,
      isDirty: fieldState.isDirty,
      isTouched: fieldState.isTouched,
      isValidating: fieldState.isValidating,
      isFocused: fieldState.isFocused,

      // Methods
      validate,
      reset,

      // HTML binding helpers
      attrs: {
        value,

        'aria-invalid': !!fieldState.error,
        ...(fieldState.error
          ? { 'aria-errormessage': `error-${fieldState.id}` }
          : {}),
      },
      events,

      // For arrays and custom field types
      name,
      id: fieldState.id,
    } as FieldReturn
  })
}
