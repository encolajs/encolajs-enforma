import { computed, onMounted, ComputedRef, ref, watch } from 'vue'
import { FieldController, FormController } from '@/types'
import { debounce } from '@/utils/debounce'

export type fieldValidateOnOption =
  | 'input'
  | 'change'
  | 'blur'
  | 'submit'
  | null

/**
 * Composable for managing a single form field
 */
export function useField(
  name: string,
  form: FormController,
  options: {
    validateOnMount?: boolean
    validateOn?: fieldValidateOnOption
  } = {}
): ComputedRef<FieldController> {
  if (!name) {
    throw new Error('Field name is required')
  }

  if (!form) {
    throw new Error('Form is required')
  }

  // Get field state from form
  const getFieldState = () => form.getField(name)

  // Create a reference to track focus state
  const isFocused = ref(false)
  
  // Create a reactive reference to track form state changes
  const localStateVersion = ref(0)
  
  // Watch for form-specific state changes and update local version
  watch(() => form.$stateVersion.value, (newVersion) => {
    localStateVersion.value = newVersion
  })

  /**
   * Handle value changes
   * @param value - New field value
   * @param trigger - Event that triggered the change ('input', 'change', 'blur')
   */
  function handleChange(
    value: any,
    trigger: 'input' | 'change' | 'blur' = 'input'
  ): void {
    // Update the form directly through the proxy
    form[name] = value

    // Mark field as touched on change event
    if (trigger === 'change') {
      form[`${name}.$isTouched`] = true

      if (options.validateOn === 'change') {
        debouncedValidate()
      }
    }

    // If field is touched and dirty, validate
    if (form[`${name}.$isTouched`] && form[`${name}.$isDirty`]) {
      debouncedValidate()
    }
  }

  /**
   * Handle blur events
   */
  function handleBlur(): void {
    isFocused.value = false
    form[`${name}.$isTouched`] = true

    if (options.validateOn === 'blur') {
      debouncedValidate()
    }
  }

  /**
   * Handle focus events
   */
  function handleFocus(): void {
    isFocused.value = true
  }

  /**
   * Validate the field
   * @returns Whether the field is valid
   */
  async function validate() {
    return await form.validateField(name)
  }

  const debouncedValidate = debounce(validate, 200)

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

  // Initial validation if needed
  onMounted(() => {
    if (options.validateOnMount) {
      validate()
    }
  })

  // Create exported API object with all field state and methods
  return computed(() => {
    // Include the local state version in the computation to ensure reactivity
    const currentStateVersion = localStateVersion.value
    
    const fieldState = getFieldState()
    const value = form[name]
    const error = fieldState?.$errors?.length > 0 ? fieldState.$errors[0] : null

    return {
      // Field value and state
      value,
      error,
      isDirty: fieldState?.$isDirty || false,
      isTouched: fieldState?.$isTouched || false,
      isValidating: fieldState?.$isValidating || false,
      isFocused: isFocused.value,
      // Expose the state version for debugging
      _stateVersion: currentStateVersion,

      // Methods
      validate,

      // HTML binding helpers
      attrs: {
        value,
        'aria-invalid': !!error,
        ...(error ? { 'aria-errormessage': `error-${fieldState?._id}` } : {}),
      },
      events,

      // For arrays and custom field types
      name,
      id: fieldState?._id,
    } as FieldController
  })
}
