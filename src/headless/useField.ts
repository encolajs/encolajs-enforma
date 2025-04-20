import { computed, ComputedRef, ref, watch } from 'vue'
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

  // Generate a unique field ID that won't change
  const fieldState = getFieldState()
  const fieldId = fieldState._id

  // Create a reference to track focus state
  const isFocused = ref(false)

  // Create a ref for the model value
  const modelValue = ref(form[name])

  // Watch for changes to the form value and update the model ref
  watch(
    () => form[name],
    (newValue) => {
      modelValue.value = newValue
    }
  )

  // Watch for changes to the model ref and update the form
  watch(modelValue, (newValue) => {
    // Only trigger validation if the field is dirty
    if (form[`${name}.$isDirty`]) {
      handleChange(newValue, 'input')
    } else {
      // Just update the value without validation
      form[name] = newValue
    }
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

    // Notify the form about field blur
    if (form.setFieldBlurred) {
      form.setFieldBlurred(name)
    }

    if (options.validateOn === 'blur') {
      debouncedValidate()
    }
  }

  /**
   * Handle focus events
   */
  function handleFocus(): void {
    isFocused.value = true

    // Notify the form about field focus
    if (form.setFieldFocused) {
      form.setFieldFocused(name)
    }
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

  // Helper function to initialize field
  function initField() {
    if (options.validateOnMount) {
      validate()
    }
  }

  // Create exported API object with all field state and methods
  return computed(() => {
    // Get the latest field state
    const fieldState = getFieldState()

    // Use the field state's version directly - this will change during field validation
    // and when the field is updated through the form mechanisms
    const fieldVersion = fieldState._version.value || 0

    const value = form[name]
    const error = fieldState?.$errors?.length > 0 ? fieldState.$errors[0] : null

    return {
      // Field value and state
      value,
      // Use the ref for the model property
      model: modelValue,
      error,
      isDirty: fieldState?.$isDirty || false,
      isTouched: fieldState?.$isTouched || false,
      isValidating: fieldState?.$isValidating || false,
      isFocused: isFocused.value,
      // Expose the field state version for debugging
      _fieldVersion: fieldVersion,

      // Methods
      validate,

      // Lifecycle methods for external management
      initField,

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
