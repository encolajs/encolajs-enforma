import { computed, ComputedRef, ref, shallowRef, watch, watchEffect } from 'vue'
import { FieldController, FieldControllerExport, FormController } from '@/types'
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
): ComputedRef<FieldControllerExport> {
  if (!name) {
    throw new Error('Field name is required')
  }

  if (!form) {
    throw new Error('Form is required')
  }

  // Get field state from form
  const getFieldController = (): FieldController => form.getField(name)

  // Create a reference to track focus state
  const isFocused = ref(false)

  // Get initial value
  const initialValue = form[name]

  // Use shallowRef for complex objects, ref for primitives
  const isComplex =
    typeof initialValue === 'object' &&
    initialValue !== null &&
    (Array.isArray(initialValue) || Object.keys(initialValue).length > 10)

  const modelValue = isComplex ? shallowRef(initialValue) : ref(initialValue)

  // Use watchEffect for automatic dependency tracking of form value changes
  watchEffect(() => {
    const formValue = form[name]
    if (modelValue.value !== formValue) {
      if (isComplex) {
        // For complex objects, replace entire reference
        modelValue.value = formValue
      } else {
        // For simple values, direct assignment
        modelValue.value = formValue
      }
    }
  })

  // Use watchEffect for automatic dependency tracking of model value changes
  watchEffect(() => {
    const currentValue = modelValue.value
    const isDirty = form[`${name}.$isDirty`]?.value

    // Only update form if the value has actually changed
    if (form[name] !== currentValue) {
      if (isDirty) {
        handleChange(currentValue, 'input')
      } else {
        // Just update the value without validation
        form.setFieldValue(name, currentValue, false)
      }
    }
  })

  /**
   * Handle value changes
   * @param value - New field value
   * @param trigger - Event that triggered the change ('input', 'change', 'blur')
   */
  async function handleChange(
    value: any,
    trigger: 'input' | 'change' | 'blur' = 'input'
  ): Promise<void> {
    // Update the form directly through the proxy
    const stateChanges = {
      $isTouched: true,
    }
    if (trigger === 'change') {
      // @ts-expect-error
      stateChanges.$isDirty = true
    }

    await form.setFieldValue(name, value, false, stateChanges)

    if (trigger === 'change' && options.validateOn === 'change') {
      debouncedValidate()
      // if touched and dirty validate on each change (input or update:modelValue)
    } else if (
      form[`${name}.$isTouched`].value &&
      form[`${name}.$isDirty`].value
    ) {
      debouncedValidate()
    }
  }

  /**
   * Handle blur events
   */
  function handleBlur(): void {
    isFocused.value = false
    // Notify the form about field blur
    if (form.setFieldBlurred) {
      form.setFieldBlurred(name)
    }

    if (form[`${name}.$isTouched`].value && form[`${name}.$isDirty`].value) {
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
    const fieldController = getFieldController()

    const value = form[name]
    const error =
      fieldController?.$errors.value.length > 0
        ? fieldController.$errors.value[0]
        : null

    return {
      // Field value and state
      value,
      // Use the ref for the model property
      model: modelValue,
      error,
      isDirty: fieldController?.$isDirty.value || false,
      isTouched: fieldController?.$isTouched.value || false,
      isValidating: fieldController?.$isValidating.value || false,
      isFocused: isFocused.value,

      // Methods
      validate,

      // Lifecycle methods for external management
      initField,

      // HTML binding helpers
      attrs: {
        value,
        'aria-invalid': !!error,
        ...(error
          ? { 'aria-errormessage': `error-${fieldController?._id}` }
          : {}),
      },
      events,

      // For arrays and custom field types
      name,
      id: fieldController?._id,
    } as FieldControllerExport
  })
}
