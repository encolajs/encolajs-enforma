import { FormController, FormOptions, ValidationRules } from '@/types'
import { useValidation } from '@/utils/useValidation'
import { ref } from 'vue'
import { generateId } from '@/utils/helpers'
import { Emitter } from 'mitt'
import { FormEvents, createFormEmitter, globalFormEmitter } from '@/utils/events'

export interface FieldState {
  $errors: string[]
  $isDirty: boolean
  $isTouched: boolean
  $isValidating: boolean
  _id: string
}

export interface StateChanges {
  $isDirty?: boolean
  $isTouched?: boolean
  $isValidating?: boolean
  $errors?: string[]
}

class FieldManager {
  private _fields: Map<string, FieldState>

  constructor() {
    this._fields = new Map<string, FieldState>()
  }

  all(): Map<string, FieldState> {
    return this._fields
  }

  delete(path: string): void {
    this._fields.delete(path)
  }

  has(path: string): boolean {
    return this._fields.has(path)
  }

  get(path: string): FieldState {
    if (!this._fields.has(path)) {
      this._fields.set(path, {
        $errors: [],
        $isDirty: false,
        $isTouched: false,
        $isValidating: false,
        _id: generateId('field', path),
      })
      // No need to signal state change here as we'll do it when getting the field
    }
    return this._fields.get(path)!
  }

  shift(arrayPath: string, startIndex: number, offset: number): void {
    const newStates = new Map<string, FieldState>()
    const prefix = `${arrayPath}.`

    for (const [path, state] of this._fields.entries()) {
      if (path.startsWith(prefix)) {
        const matches = path.match(new RegExp(`^${arrayPath}\\.(\\d+)\\.(.*)$`))
        if (matches) {
          const index = parseInt(matches[1])
          const rest = matches[2]

          if (index >= startIndex) {
            const newPath = `${arrayPath}.${index + offset}.${rest}`
            newStates.set(newPath, state)
          } else {
            newStates.set(path, state)
          }
        }
      } else {
        newStates.set(path, state)
      }
    }

    this._fields = newStates
  }

  move(arrayPath: string, fromIndex: number, toIndex: number): void {
    // Early return if indices are the same
    if (fromIndex === toIndex) return

    const prefix = `${arrayPath}.`
    const prefixLength = prefix.length

    // Pre-compile the path parts extractor
    const getIndexAndRest = (path: string): [number, string] | null => {
      const withoutPrefix = path.slice(prefixLength)
      const dotIndex = withoutPrefix.indexOf('.')
      if (dotIndex === -1) return null
      return [
        parseInt(withoutPrefix.slice(0, dotIndex)),
        withoutPrefix.slice(dotIndex + 1),
      ]
    }

    // Only process fields that need to change
    const changes = new Map<string, FieldState>()

    for (const [path, state] of this._fields) {
      if (!path.startsWith(prefix)) continue

      const parsed = getIndexAndRest(path)
      if (!parsed) continue

      const [index, rest] = parsed
      let newIndex = index

      if (index === fromIndex) {
        newIndex = toIndex
      } else if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
        newIndex = index - 1
      } else if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
        newIndex = index + 1
      } else {
        continue // Skip fields that don't need to move
      }

      if (newIndex !== index) {
        const newPath = `${prefix}${newIndex}.${rest}`
        changes.set(newPath, state)
        this._fields.delete(path)
      }
    }

    // Apply changes in batch
    for (const [newPath, state] of changes) {
      this._fields.set(newPath, state)
    }
  }
  reorder(arrayPath: string, newPositions: Map<number, number>): void {
    const newStates = new Map<string, FieldState>()
    const prefix = `${arrayPath}.`

    for (const [path, state] of this._fields.entries()) {
      if (path.startsWith(prefix)) {
        const matches = path.match(new RegExp(`^${arrayPath}\\.(\\d+)\\.(.*)$`))
        if (matches) {
          const oldIndex = parseInt(matches[1])
          const rest = matches[2]
          const newIndex = newPositions.get(oldIndex)
          if (newIndex !== undefined) {
            const newPath = `${arrayPath}.${newIndex}.${rest}`
            newStates.set(newPath, state)
          }
        }
      } else {
        newStates.set(path, state)
      }
    }

    this._fields = newStates
  }
}

export function useForm<T extends object>(
  values: object,
  rules: ValidationRules = {},
  options: FormOptions = {}
): T & FormController {
  // Create form-specific event emitter
  const formEmitter: Emitter<FormEvents> = options.useGlobalEvents 
    ? globalFormEmitter 
    : createFormEmitter();
  
  const formStateVersion = ref(0)
  const valuesCopy: object =
    // @ts-expect-error Initial values can be a complex object with a clone() method
    values.clone && typeof values?.clone === 'function'
      ? // @ts-expect-error Initial values can be a complex object with a clone() method
        values.clone()
      : JSON.parse(JSON.stringify(values))
  const fieldManager = new FieldManager()
  const formState = {
    $isValidating: false,
    $isSubmitting: false,
    $isDirty: false,
    $isTouched: false,
    $stateVersion: formStateVersion,
  }
  // Create a form-specific state version counter
  const valuesRef = ref(values)

  const validationFactory = options.validatorFactory || useValidation().factory
  const validator = validationFactory.make(rules, {
    ...(options.customMessages || {}),
  })

  async function validateField(
    path: string,
    state: FieldState
  ): Promise<boolean> {
    if (!validator) return true

    try {
      state.$isValidating = true
      state.$isTouched = true
      state.$isDirty = true
      const isValid = await validator.validatePath(path, values)
      if (!isValid) {
        state.$errors = validator.getErrorsForPath(path)
        // Signal a state change when errors are added
        formStateVersion.value++
        return false
      }
      // Signal a state change when errors are cleared
      if (state.$errors.length > 0) {
        state.$errors = []
        formStateVersion.value++
      } else {
        state.$errors = []
      }
      return true
    } catch (e: any) {
      console.error(`Error validating field ${path}`, e)
      return false
    } finally {
      state.$isValidating = false
      // Signal a state change when validation completes
      formStateVersion.value++
    }
  }

  async function validateForm(): Promise<boolean> {
    formState.$isValidating = true
    try {
      const validationResults = await Promise.all(
        Array.from(fieldManager.all().entries()).map(([path, state]) => {
          return validateField(path, state)
        })
      )
      return validationResults.every((result) => result)
    } catch (e) {
      console.error('Error validating form', e)
    } finally {
      formState.$isValidating = false
    }

    return false
  }

  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((curr, part) => curr?.[part], obj)
  }

  function setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.')
    const lastPart = parts.pop()!

    const target = parts.reduce((curr, part) => {
      if (!curr[part] || typeof curr[part] !== 'object') {
        const nextPart = parts[parts.indexOf(part) + 1]
        curr[part] = !isNaN(Number(nextPart)) ? [] : {}
      }
      return curr[part]
    }, obj)

    target[lastPart] = value
  }

  function getArrayByPath(obj: any, arrayPath: string): any[] {
    return getValueByPath(obj, arrayPath)
  }

  async function _handleSetValue(
    path: string,
    value: any,
    validate = true,
    stateChanges: StateChanges = {}
  ): Promise<void> {
    const state = fieldManager.get(path)
    setValueByPath(valuesRef.value, path, value)
    if (validate) {
      await validateField(path, state)
    }
    Object.entries(stateChanges).forEach(([key, val]) => {
      const stateKey = key as keyof FieldState
      ;(state[stateKey] as any) = val
      if (key === '$isDirty' && val === true) {
        formState.$isDirty = true
      }
    })
  }

  // Helper function to reindex field states after array element removal
  function reindexArrayFieldStates(arrayPath: string, removedIndex: number) {
    const prefix = `${arrayPath}.`
    const fieldsToReindex = new Map<string, FieldState>()

    // Collect all fields that need reindexing
    fieldManager.all().forEach((state, path) => {
      if (path.startsWith(prefix)) {
        const parts = path.split('.')
        const currentIndex = parseInt(parts[parts.length - 2])
        if (currentIndex > removedIndex) {
          // This field needs to be reindexed
          const newPath = path.replace(
            `${prefix}${currentIndex}.`,
            `${prefix}${currentIndex - 1}.`
          )
          fieldsToReindex.set(newPath, state)
          fieldManager.delete(path)
        }
      }
    })

    // Add reindexed fields back using the underlying Map functionality
    fieldsToReindex.forEach((state, newPath) => {
      fieldManager.all().set(newPath, state)
    })
  }

  const formController = new Proxy(
    {
      // Event emitter methods
      on(event: keyof FormEvents, handler: Function) {
        formEmitter.on(event, handler as any);
        return this;
      },
      
      off(event: keyof FormEvents, handler?: Function) {
        formEmitter.off(event, handler as any);
        return this;
      },
      
      emit(event: keyof FormEvents, data: any) {
        formEmitter.emit(event, data);
        return this;
      },
      
      submit: async function() {
        // Store reference to the form controller
        const formController = this;
        formState.$isSubmitting = true;

        try {
          // Validate all fields
          const isValid = await validateForm();

          // Mark all fields as touched before validation
          fieldManager.all().forEach((state, path) => {
            state.$isTouched = true;
            state.$isDirty = true;
          });

          // Signal state change after marking all fields
          formStateVersion.value++;

          if (!isValid) {
            // Call validation error callback if provided
            if (options.onValidationError) {
              options.onValidationError(formController);
            }
            
            // Emit validation error event
            formEmitter.emit('validation_error', { formController });
            
            return false;
          }

          if (options.submitHandler) {
            try {
              // Pass both the form values and the form controller
              await options.submitHandler(valuesRef.value, formController);

              // Call submit success callback if provided
              if (options.onSubmitSuccess) {
                options.onSubmitSuccess(valuesRef.value);
              }
              
              // Emit submit success event
              formEmitter.emit('submit_success', { formController });
              
            } catch (error) {
              // Call submit error callback if provided
              if (options.onSubmitError) {
                options.onSubmitError(error, formController);
              }
              
              // Emit submit error event
              formEmitter.emit('submit_error', { error, formController });
              
              console.error('Error submitting form', error);
              return false;
            }
          } else {
            // If no submit handler but form is valid, emit success
            formEmitter.emit('submit_success', { formController });
          }

          return true;
        } finally {
          formState.$isSubmitting = false;
        }
      },

      reset(): void {
        // Reset the business object to initial state
        Object.keys(valuesRef.value).forEach((key) => {
          if (valuesCopy && key in valuesCopy) {
            ;(valuesRef.value as Record<string, any>)[key] = (
              valuesCopy as Record<string, any>
            )[key]
          } else {
            // Reset to default empty values based on type
            ;(valuesRef.value as Record<string, any>)[key] = Array.isArray(
              (valuesRef.value as Record<string, any>)[key]
            )
              ? []
              : typeof (valuesRef.value as Record<string, any>)[key] ===
                'object'
              ? {}
              : null
          }
        })

        // Clear all field states
        fieldManager.all().forEach((state, path) => {
          try {
            // Check if the path still exists in the business object
            const value = getValueByPath(valuesRef.value, path)

            if (value !== undefined) {
              // Path still exists, reset the state but keep the field registered
              state.$errors = []
              state.$isDirty = false
              state.$isTouched = false
              state.$isValidating = false
              // Preserve the ID
            } else {
              // Path no longer exists, remove the field state
              fieldManager.delete(path)
            }
          } catch (e) {
            // If path resolution throws an error, the path is no longer valid
            fieldManager.delete(path)
          }
        })

        // Reset form-level state
        formState.$isDirty = false
        formState.$isTouched = false
        formState.$isValidating = false
        formState.$isSubmitting = false

        // Signal form reset complete
        formStateVersion.value++
        
        // Emit form reset event
        formEmitter.emit('form_reset', { formController: this });
      },

      async validate(): Promise<boolean> {
        return await validateForm()
      },

      async validateField(path: string): Promise<boolean> {
        const state = fieldManager.get(path)
        return await validateField(path, state)
      },

      async setFieldValue(
        path: string,
        value: any,
        validate = true,
        stateChanges: StateChanges = {}
      ): Promise<void> {
        await _handleSetValue(path, value, validate, stateChanges)
        
        // Emit field_changed event
        const state = fieldManager.get(path)
        formEmitter.emit('field_changed', {
          path,
          value,
          fieldState: state,
          formController: this
        })
      },

      getField(path): FieldState {
        return fieldManager.get(path)
      },

      removeField(path): void {
        return fieldManager.delete(path)
      },

      hasField(path): boolean {
        return fieldManager.has(path)
      },
      
      setFieldFocused(path: string): void {
        const state = fieldManager.get(path)
        state.$isTouched = true
        formStateVersion.value++
        
        // Emit field focused event
        formEmitter.emit('field_focused', {
          path,
          fieldState: state,
          formController: this
        })
      },
      
      setFieldBlurred(path: string): void {
        const state = fieldManager.get(path)
        state.$isTouched = true
        formStateVersion.value++
        
        // Emit field blurred event
        formEmitter.emit('field_blurred', {
          path,
          fieldState: state,
          formController: this
        })
      },

      setFieldErrors(path: string, errors: string[]): void {
        const state = fieldManager.get(path)
        state.$errors = errors
        state.$isTouched = true
        formStateVersion.value++
      },

      setErrors(errors: Record<string, string[]>): void {
        Object.entries(errors).forEach(([path, errorMessages]) => {
          this.setFieldErrors(path, errorMessages)
        })
      },

      values(): object {
        return valuesRef.value
      },

      errors(): object {
        const errors: Record<string, string[]> = {}
        fieldManager.all().forEach((state, path) => {
          errors[path] = state.$errors
        })
        return errors
      },

      add(arrayPath: string, index: number, item: any): void {
        const array = getArrayByPath(valuesRef.value, arrayPath) || []
        array.splice(index, 0, item)
        fieldManager.shift(arrayPath, index, 1)
        formStateVersion.value++
      },

      remove(arrayPath: string, index: number): void {
        const array = getArrayByPath(valuesRef.value, arrayPath)
        if (!Array.isArray(array)) return

        // Remove the element
        array.splice(index, 1)

        // Remove field states for the removed element
        const prefix = `${arrayPath}.${index}.`
        fieldManager.all().forEach((_, path) => {
          if (path.startsWith(prefix)) {
            fieldManager.delete(path)
          }
        })

        // Reindex remaining field states
        reindexArrayFieldStates(arrayPath, index)

        // Signal state change
        formStateVersion.value++
      },

      move(arrayPath: string, fromIndex: number, toIndex: number): void {
        const array = getArrayByPath(valuesRef.value, arrayPath)
        const [item] = array.splice(fromIndex, 1)
        array.splice(toIndex, 0, item)
        fieldManager.move(arrayPath, fromIndex, toIndex)
        formStateVersion.value++
      },

      sort(arrayPath: string, callback: (a: any, b: any) => number): void {
        const array = getArrayByPath(valuesRef.value, arrayPath)
        const itemsWithIndices = array.map((item, index) => ({ item, index }))
        itemsWithIndices.sort((a, b) => callback(a.item, b.item))
        const newPositions = new Map(
          itemsWithIndices.map((item, newIndex) => [item.index, newIndex])
        )

        array.sort(callback)
        fieldManager.reorder(arrayPath, newPositions)
        formStateVersion.value++
      },
    } as FormController,
    {
      get(target: FormController, prop: string | symbol): any {
        if (typeof target[prop as keyof FormController] === 'function') {
          return target[prop as keyof FormController]
        }

        if (typeof prop === 'string') {
          if (prop.startsWith('$')) {
            // @ts-expect-error Form state properties are the only ones we want to expose
            return formState[prop]
          }
          const isMetaProp = prop.includes('.$')
          if (isMetaProp) {
            const [path, metaProp] = prop.split('.$')
            const state = fieldManager.get(path)

            switch (metaProp) {
              case 'errors':
                return state.$errors
              case 'isDirty':
                return state.$isDirty
              case 'isTouched':
                return state.$isTouched
              case 'isValid':
                return state.$errors.length === 0
              case 'isValidating':
                return state.$isValidating
            }
          } else {
            fieldManager.get(prop) // to ensure the field exists
            return getValueByPath(valuesRef.value, prop)
          }
        }

        return undefined
      },

      set(_: FormController, prop: string | symbol, value: any): boolean {
        if (typeof prop === 'string') {
          if (prop.includes('.$')) {
            const [path, metaProp] = prop.split('.$')
            const state = fieldManager.get(path)
            const metaKey = `$${metaProp}` as keyof FieldState
            const prevValue = state[metaKey]

            switch (metaProp) {
              case 'isDirty':
              case 'isTouched':
              case 'isValidating':
              case 'errors': {
                ;(state[metaKey] as any) = value
                // Only increment if value actually changed
                if (prevValue !== value) {
                  formStateVersion.value++
                }
                break
              }
            }
            if (['isDirty', 'isTouched'].includes(metaProp) && value === true) {
              // @ts-expect-error formState has $isDirty and $isTouched properties
              formState[`$${metaProp}`] = true
            }
          } else {
            // Set the value immediately
            setValueByPath(valuesRef.value, prop, value)
            const state = fieldManager.get(prop)
            state.$isDirty = true

            // Increment state version for field value changes
            formStateVersion.value++

            // Handle validation asynchronously
            Promise.resolve().then(() => {
              return _handleSetValue(prop, value, true, { $isDirty: true })
            })
          }
        }
        return true
      },
    }
  ) as T & FormController
  
  // Emit form initialization event - using setTimeout to ensure all initialization is complete
  setTimeout(() => {
    formEmitter.emit('form_initialized', { formController });
  }, 0);
  
  return formController as T & FormController
}
