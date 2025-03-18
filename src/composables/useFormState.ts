import { reactive, computed, ref } from 'vue'
import { TentativeValuesDataSource } from '@encolajs/validator'
import { DataSourceInterface, PlainObjectDataSource } from '@encolajs/validator'
import {
  FormStateOptions,
  FormStateReturn,
  ValidationRules,
  FieldState,
  EventTrigger,
} from '../types'
import { useValidation } from './useValidation'

function generateFieldId(path: string): string {
  return `field_${path}_${Math.random().toString(36).substring(2)}_${Date.now()}`
}

/**
 * Composable for managing form state and validation
 *
 * @param dataSource - The data source containing the form data
 * @param rules - Validation rules
 * @param options - Configuration options
 * @returns Form state and methods
 */
export function useFormState(
  dataSource: DataSourceInterface,
  rules: ValidationRules = {},
  options: FormStateOptions = {}
): FormStateReturn {
  if (!dataSource) {
    throw new Error('useFormState requires a dataSource')
  }

  // Create validator from rules and custom messages
  const validationFactory = options.validatorFactory || useValidation().factory
  const validator = validationFactory.make(rules, options.customMessages || {})

  // assume we got a plain object
  if (!dataSource.clone || !dataSource.getRawData) {
    dataSource = new PlainObjectDataSource(dataSource)
  }

  let tentativeDataSource: TentativeValuesDataSource
  try {
    tentativeDataSource = new TentativeValuesDataSource(dataSource.clone(), {})
  } catch (error) {
    console.error('Error creating tentative data source:', error)
    dataSource = new PlainObjectDataSource({})
    tentativeDataSource = new TentativeValuesDataSource(dataSource.clone(), {})
  }

  // Track form state
  const fields = new Map<string, FieldState>()
  const pathToId = new Map<string, string>()
  const isSubmitting = ref(false)
  const isValidating = ref(false)
  const validationCount = ref(0)
  const submitted = ref(false)

  // Track errors at the form level
  const errors = reactive<Record<string, string[]>>({})

  // Computed properties
  const isDirty = ref(false)

  const isTouched = ref(false)

  const isValid = computed((): boolean => {
    return Object.keys(errors).length === 0
  })

  function getFieldId(path: string): string {
    return pathToId.get(path) || generateFieldId(path)
  }

  function registerField(name: string, existingId?: string): FieldState {
    if (!name) {
      throw new Error('Field name is required')
    }

    // Check if field exists at this path
    const currentId = pathToId.get(name)

    // If exists and matches provided ID, return existing state
    if (currentId && existingId && currentId === existingId) {
      return fields.get(currentId)!
    }

    // If field exists at different path, update path mapping
    if (existingId && fields.has(existingId)) {
      // Remove old path mapping if exists
      for (const [oldPath, id] of pathToId.entries()) {
        if (id === existingId) {
          pathToId.delete(oldPath)
        }
      }

      // Update existing field state with new path
      const existingState = fields.get(existingId)!
      existingState.path = name
      pathToId.set(name, existingId)
      return existingState
    }

    existingId = pathToId.get(name)
    if (existingId && fields.has(existingId)) {
      return fields.get(existingId)!
    }

    // Get or generate field ID
    const fieldId = existingId || getFieldId(name)

    // Create new field state
    const fieldState: FieldState = reactive({
      id: fieldId,
      path: name,
      value: tentativeDataSource.getValue(name),
      error: null,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      isVisited: false,
      isFocused: false
    })

    // Store field state and path mapping
    fields.set(fieldId, fieldState)
    pathToId.set(name, fieldId)

    return fieldState
  }

  function getField(name: string): FieldState | undefined {
    const fieldId = pathToId.get(name)
    return fieldId ? fields.get(fieldId) : undefined
  }

  function unregisterField(path?: string) {
    if (!path) {
      return
    }
    // Find all direct children of this path
    const childPaths = Array.from(pathToId.keys()).filter(fieldPath => {
      // Since all paths use dot notation, we can simplify the check
      // We want immediate children only (one dot level deeper)
      return fieldPath.startsWith(`${path}.`) &&
        fieldPath.slice(path.length + 1).indexOf('.') === -1
    })

    // Recursively unregister children first
    childPaths.forEach(childPath => unregisterField(childPath))

    // Now handle this field
    const fieldId = pathToId.get(path)
    if (!fieldId) return

    // Remove path mapping
    pathToId.delete(path)

    // Check if field is still referenced by another path
    const isFieldInUse = Array.from(pathToId.values()).includes(fieldId)

    // Only remove field state if not in use
    if (!isFieldInUse) {
      fields.delete(fieldId)

      // Clean up any errors
      if (errors[path]) {
        delete errors[path]
      }
    }
  }

  /**
   * Update a field's value
   * @param name - Field name/path
   * @param value - New field value
   * @param trigger - Event trigger ('input', 'change', 'blur')
   */
  function setFieldValue(
    name: string,
    value: any,
    trigger: EventTrigger = 'input'
  ): void {
    const fieldState = registerField(name)
    const oldValue = fieldState.value

    // Update the field state
    fieldState.value = value

    // Only update dirty if value actually changed
    if (!fieldState.isDirty && value !== oldValue) {
      fieldState.isDirty = true
      isDirty.value = true
    }

    // Update the tentative data source
    tentativeDataSource.setValue(name, value)

    // If this is a change event, consider it as a touch event too
    if (trigger === 'change' || trigger === 'blur') {
      fieldState.isTouched = true
    }

    // Validate if needed
    const shouldValidate = options?.validateOn === trigger || options?.validateOn === 'input'
    if (shouldValidate) {
      validateField(name)
    }

    // Commit to actual data source if configured to do so
    const syncOn = options.syncOn || 'blur'

    if (
      syncOn === 'input' ||
      (syncOn === 'change' && trigger === 'change') ||
      (syncOn === 'blur' && trigger === 'blur')
    ) {
      tentativeDataSource.commit(name)
    }

    // Trigger any dependencies
    const dependencies = validator.getDependentFields?.(name) || []

    for (const dependency of dependencies) {
      if (
        fields.has(dependency) &&
        fields.get(dependency)!.isTouched
      ) {
        validateField(dependency)
      }
    }
  }

  /**
   * Mark a field as touched (e.g., on blur)
   * @param name - Field name/path
   */
  function touchField(name: string): void {
    const fieldState = registerField(name)

    isTouched.value = true
    fieldState.isTouched = true
    fieldState.isVisited = true

    // Validate if configured to do so
    const validateOn = options.validateOn || 'blur'

    if (validateOn === 'blur') {
      validateField(name)
    }

    // Commit to actual data source if configured to do so
    const syncOn = options.syncOn || 'blur'

    if (syncOn === 'blur') {
      tentativeDataSource.commit(name)
    }
  }

  /**
   * Validate a specific field
   * @param name - Field name/path
   * @returns Whether the field is valid
   */
  async function validateField(name: string): Promise<boolean> {
    const fieldState = registerField(name)

    fieldState.isValidating = true
    validationCount.value++
    isValidating.value = true

    try {
      // Commit the current value to the validator's data source
      tentativeDataSource.commit(name)

      // Perform validation
      const isValid = await validator.validatePath(name, dataSource)

      // Update error state
      if (!isValid) {
        const fieldErrors = validator.getErrorsForPath(name)
        fieldState.error = fieldErrors[0] || null
        fieldState.isValid = false
        errors[name] = fieldErrors
      } else {
        fieldState.error = null
        fieldState.isValid = true
        delete errors[name]
      }

      return isValid
    } catch (error: any) {
      console.error(`Error validating field ${name}:`, error)
      fieldState.error = error.message
      errors[name] = [error.message]
      return false
    } finally {
      fieldState.isValidating = false
      validationCount.value--
      isValidating.value = validationCount.value > 0
    }
  }

  /**
   * Validate the entire form
   * @returns Whether the form is valid
   */
  async function validate(): Promise<boolean> {
    isValidating.value = true

    try {
      // Commit all tentative values
      tentativeDataSource.commitAll()

      // Perform validation on all fields
      const isValid = await validator.validate(dataSource)

      // Update error state
      if (!isValid) {
        const allErrors = validator.getErrors()

        // Update form-level errors
        Object.assign(errors, allErrors)

        // Update field-level errors
        for (const [path, fieldErrors] of Object.entries(allErrors)) {
          if (getField(path)) {
            const fieldState = getField(path)!
            fieldState.error = (fieldErrors as Array<string>)[0] || null
          }
        }
      } else {
        // Clear all errors
        for (const key of Object.keys(errors)) {
          delete errors[key]
        }

        // Clear field-level errors
        for (const fieldState of fields.values()) {
          fieldState.error = null
        }
      }

      return isValid
    } finally {
      isValidating.value = false
    }
  }

  /**
   * Reset the form to its initial state
   */
  function reset(): void {
    // Clear all errors
    for (const key of Object.keys(errors)) {
      delete errors[key]
    }

    // Reset field states
    for (const [name, fieldState] of fields.entries()) {
      fieldState.value = dataSource.getValue(name)
      fieldState.error = null
      fieldState.isDirty = false
      fieldState.isTouched = false
      fieldState.isValidating = false
    }

    // Reset form state
    isTouched.value = false
    isSubmitting.value = false
    isValidating.value = false
    validationCount.value = 0
    submitted.value = false
    isDirty.value = false

    // Reset tentative values
    tentativeDataSource = new TentativeValuesDataSource(dataSource.clone(), {})

    // Reset the validator
    validator.reset()
  }

  /**
   * Submit the form
   * @returns Whether the submission was successful
   */
  async function submit(): Promise<boolean> {
    isSubmitting.value = true
    submitted.value = true

    // Mark all fields as touched for validation display
    for (const fieldState of fields.values()) {
      fieldState.isTouched = true
    }

    try {
      // Validate the form
      const isValid = await validate()

      if (isValid && options.submitHandler) {
        // Run submit handler with the current data
        await options.submitHandler(dataSource.getRawData())
      }

      return isValid
    } catch (error) {
      console.error('Error submitting form:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // Return the form API
  return {
    errors,
    fields,
    pathToId,

    // State for UI
    isValid,
    isValidating,
    isSubmitting,
    submitted,
    isDirty,
    isTouched,
    validationCount,

    // Field management
    registerField,
    unregisterField,
    touchField,
    getField,

    // Form actions
    validate,
    validateField,
    reset,
    submit,

    // Data access
    setFieldValue,
    getFieldValue: (name: string): any => tentativeDataSource.getValue(name),
    getData: (): any => tentativeDataSource.getRawData(),
    setData: (newData: Record<string, any>): void => {
      // Reset the form
      reset()
      // Replace the data in the data source
      for (const key of Object.keys(newData)) {
        dataSource.setValue(key, newData[key])
      }
    },
  }
}
