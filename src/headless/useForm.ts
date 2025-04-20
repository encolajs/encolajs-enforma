import { FormController, FormOptions, ValidationRules } from '@/types'
import { useValidation } from '@/utils/useValidation'
import { Ref, ref } from 'vue'
import { generateId } from '@/utils/helpers'
import { Emitter } from 'mitt'
import {
  FormEvents,
  createFormEmitter,
  globalFormEmitter,
} from '@/utils/events'

export interface FieldController {
  $errors: Ref<string[]>
  $isDirty: Ref<boolean>
  $isTouched: Ref<boolean>
  $isValidating: Ref<boolean>
  _id: string
}

export interface StateChanges {
  $isDirty?: boolean
  $isTouched?: boolean
  $isValidating?: boolean
  $errors?: string[]
}

class FieldManager {
  private _fields: Map<string, FieldController>

  constructor() {
    this._fields = new Map<string, FieldController>()
  }

  all(): Map<string, FieldController> {
    return this._fields
  }

  delete(path: string): void {
    this._fields.delete(path)
  }

  has(path: string): boolean {
    return this._fields.has(path)
  }

  get(path: string): FieldController {
    if (!this._fields.has(path)) {
      this._fields.set(path, {
        $errors: ref([]),
        $isDirty: ref(false),
        $isTouched: ref(false),
        $isValidating: ref(false),
        _id: generateId('field', path),
      })
      // No need to signal state change here as we'll do it when getting the field
    }
    return this._fields.get(path)!
  }

  shift(arrayPath: string, startIndex: number, offset: number): void {
    const newStates = new Map<string, FieldController>()
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
    const changes = new Map<string, FieldController>()

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
    const newStates = new Map<string, FieldController>()
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
    : createFormEmitter()

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
  }
  // Create a form-specific state version counter
  const valuesRef = ref(values)

  const validationFactory = options.validatorFactory || useValidation().factory
  const validator = validationFactory.make(rules, {
    ...(options.customMessages || {}),
  })

  async function validateField(
    path: string,
    fieldController: FieldController
  ): Promise<boolean> {
    if (!validator) return true

    try {
      fieldController.$isValidating.value = true
      fieldController.$isTouched.value = true
      fieldController.$isDirty.value = true

      const isValid = await validator.validatePath(path, valuesRef.value)
      if (!isValid) {
        fieldController.$errors.value = validator.getErrorsForPath(path)
        return false
      }

      if (fieldController.$errors.value.length > 0) {
        fieldController.$errors.value = []
      }
      return true
    } catch (e: any) {
      console.error(`Error validating field ${path}`, e)
      return false
    } finally {
      fieldController.$isValidating.value = false
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
      const stateKey = key as keyof FieldController
      ;(state[stateKey] as any).value = val
      if (key === '$isDirty' && val === true) {
        formState.$isDirty = true
      }
    })
  }

  // Helper function to reindex field states after array element removal
  function reindexArrayFieldControllers(
    arrayPath: string,
    removedIndex: number
  ) {
    const prefix = `${arrayPath}.`
    const fieldsToReindex = new Map<string, FieldController>()

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
        formEmitter.on(event, handler as any)
        return this
      },

      off(event: keyof FormEvents, handler?: Function) {
        formEmitter.off(event, handler as any)
        return this
      },

      emit(event: keyof FormEvents, data: any) {
        formEmitter.emit(event, data)
        return this
      },

      submit: async function () {
        formState.$isSubmitting = true

        try {
          // Mark all fields as touched before validation
          fieldManager.all().forEach((fieldController, path) => {
            fieldController.$isTouched.value = true
            fieldController.$isDirty.value = true
          })

          // Validate all fields
          const isValid = await validateForm()

          if (!isValid) {
            // Call validation error callback if provided
            if (options.onValidationError) {
              options.onValidationError(formController)
            }

            // Emit validation error event
            formEmitter.emit('validation_error', { formController })

            return false
          }

          if (options.submitHandler) {
            try {
              // Pass both the form values and the form controller
              await options.submitHandler(valuesRef.value, formController)

              // Call submit success callback if provided
              if (options.onSubmitSuccess) {
                options.onSubmitSuccess(valuesRef.value)
              }

              // Emit submit success event
              formEmitter.emit('submit_success', { formController })
            } catch (error) {
              // Call submit error callback if provided
              if (options.onSubmitError) {
                options.onSubmitError(error, formController)
              }

              // Emit submit error event
              formEmitter.emit('submit_error', { error, formController })

              console.error('Error submitting form', error)
              return false
            }
          } else {
            // If no submit handler but form is valid, emit success
            formEmitter.emit('submit_success', { formController })
          }

          return true
        } finally {
          formState.$isSubmitting = false
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
        fieldManager.all().forEach((fieldController, path) => {
          try {
            // Check if the path still exists in the business object
            const value = getValueByPath(valuesRef.value, path)

            if (value !== undefined) {
              // Path still exists, reset the state but keep the field registered
              fieldController.$errors.value = []
              fieldController.$isDirty.value = false
              fieldController.$isTouched.value = false
              fieldController.$isValidating.value = false
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

        // Field values are now refs, no need for explicit version updates

        // Emit form reset event
        formEmitter.emit('form_reset', { formController: this })
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
        const fieldController = fieldManager.get(path)
        formEmitter.emit('field_changed', {
          path,
          value,
          fieldController,
          formController: this,
        })
      },

      getField(path): FieldController {
        return fieldManager.get(path)
      },

      removeField(path): void {
        return fieldManager.delete(path)
      },

      hasField(path): boolean {
        return fieldManager.has(path)
      },

      setFieldFocused(path: string): void {
        const fieldController = fieldManager.get(path)
        fieldController.$isTouched.value = true

        // Emit field focused event
        formEmitter.emit('field_focused', {
          path,
          fieldController,
          formController: this,
        })
      },

      setFieldBlurred(path: string): void {
        const fieldController = fieldManager.get(path)
        fieldController.$isTouched.value = true

        // Emit field blurred event
        formEmitter.emit('field_blurred', {
          path,
          fieldController,
          formController: this,
        })
      },

      setFieldErrors(path: string, errors: string[]): void {
        const fieldController = fieldManager.get(path)
        fieldController.$errors.value = errors
        fieldController.$isTouched.value = true
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
        fieldManager.all().forEach((fieldController, path) => {
          errors[path] = fieldController.$errors.value
        })
        return errors
      },

      add(arrayPath: string, index: number, item: any): void {
        const array = getArrayByPath(valuesRef.value, arrayPath) || []
        array.splice(index, 0, item)
        fieldManager.shift(arrayPath, index, 1)
        // With reactive refs, we no longer need to increment version
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
        reindexArrayFieldControllers(arrayPath, index)
        // With reactive refs, we no longer need to increment version
      },

      move(arrayPath: string, fromIndex: number, toIndex: number): void {
        const array = getArrayByPath(valuesRef.value, arrayPath)
        const [item] = array.splice(fromIndex, 1)
        array.splice(toIndex, 0, item)
        fieldManager.move(arrayPath, fromIndex, toIndex)
        // With reactive refs, we no longer need to increment version
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
        // With reactive refs, we no longer need to increment version
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
            const fieldController = fieldManager.get(path)

            switch (metaProp) {
              case 'errors':
                return fieldController.$errors
              case 'isDirty':
                return fieldController.$isDirty
              case 'isTouched':
                return fieldController.$isTouched
              case 'isValid':
                return fieldController.$errors.value.length === 0
              case 'isValidating':
                return fieldController.$isValidating
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
            const fieldController = fieldManager.get(path)
            const metaKey = `$${metaProp}` as keyof FieldController
            const prevValue = fieldController[metaKey]

            switch (metaProp) {
              case 'isDirty':
              case 'isTouched':
              case 'isValidating':
              case 'errors': {
                ;(fieldController[metaKey] as any).value = value
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
            const fiel = fieldManager.get(prop)
            fiel.$isDirty.value = true

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
    formEmitter.emit('form_initialized', { formController })
  }, 0)

  return formController as T & FormController
}
