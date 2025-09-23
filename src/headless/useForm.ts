import { FormController, FormOptions, ValidationRules } from '@/types'
import { useValidation } from '@/utils/useValidation'
import {
  computed,
  Ref,
  ref,
  shallowRef,
  effectScope,
  EffectScope,
  watchEffect,
} from 'vue'
import { generateId, pathUtils } from '@/utils/helpers'
import { useConfig } from '@/utils/useConfig'
import { Emitter } from 'mitt'
import {
  FormEvents,
  createFormEmitter,
  globalFormEmitter,
} from '@/utils/events'
import moveArrayItem from '@/utils/moveArrayItem'

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
  private _fieldScopes: Map<string, EffectScope>

  constructor() {
    this._fields = new Map<string, FieldController>()
    this._fieldScopes = new Map<string, EffectScope>()
  }

  all(): Map<string, FieldController> {
    return this._fields
  }

  delete(path: string): void {
    // Clean up field-specific effects
    const fieldScope = this._fieldScopes.get(path)
    if (fieldScope) {
      fieldScope.stop()
      this._fieldScopes.delete(path)
    }
    this._fields.delete(path)
  }

  has(path: string): boolean {
    return this._fields.has(path)
  }

  get(path: string): FieldController {
    if (!this._fields.has(path)) {
      // Create dedicated scope for this field
      const fieldScope = effectScope()
      this._fieldScopes.set(path, fieldScope)

      let fieldController: FieldController
      fieldScope.run(() => {
        fieldController = {
          $errors: ref([]),
          $isDirty: ref(false),
          $isTouched: ref(false),
          $isValidating: ref(false),
          _id: generateId('field', path),
        }

        // Field-specific reactive effects can be added here in the future
        // For example, cross-field validation watchers
      })

      this._fields.set(path, fieldController!)
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
  // Create main form scope for form-level effects
  const formScope = effectScope()

  let formEmitter: Emitter<FormEvents>
  let config: any
  let cloneFn: any
  let valuesCopy: object
  let fieldManager: FieldManager
  let formState: any
  let valuesRef: any
  let formVersion: any

  formScope.run(() => {
    // Create form-specific event emitter
    formEmitter = options.useGlobalEvents
      ? globalFormEmitter
      : createFormEmitter()

    // Use form config to access the clone function
    config = useConfig()
    cloneFn = config.behavior.cloneFn
    valuesCopy = cloneFn(values)
    fieldManager = new FieldManager()
    formState = {
      $isValidating: ref(false),
      $isSubmitting: ref(false),
      $isDirty: ref(false),
      $isTouched: ref(false),
    }
    // Use shallowRef for performance with large/complex data
    valuesRef = shallowRef(values)
    formVersion = ref(0) // Manual reactivity trigger

    // Form-level reactive effects using watchEffect for automatic dependency tracking
    watchEffect(() => {
      // Track form-level state changes automatically
      const isValidating = formState.$isValidating.value
      const isSubmitting = formState.$isSubmitting.value
      const isDirty = formState.$isDirty.value
      const isTouched = formState.$isTouched.value

      // This effect will re-run when any form state changes
      // Can be used for global form state monitoring or side effects
    })
  })

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
      await Promise.all(
        validator.getDependentFields(path).map((dependant) => {
          const depCtrl = fieldManager.get(dependant)
          if (depCtrl.$isDirty.value && !depCtrl.$isValidating.value) {
            validateField(dependant, depCtrl)
          }
        })
      )
      if (!isValid) {
        fieldController.$errors.value = validator.getErrorsForPath(path)
        return false
      }

      if (fieldController.$errors.value.length > 0) {
        fieldController.$errors.value = []
      }
      return true
    } catch (e: any) {
      console.error(`[Enforma] Error validating field ${path}`, e)
      return false
    } finally {
      fieldController.$isValidating.value = false
    }
  }

  async function validateForm(): Promise<boolean> {
    formState.$isValidating.value = true
    try {
      const validationResults = await Promise.all(
        Array.from(fieldManager.all().entries()).map(([path, state]) => {
          return validateField(path, state)
        })
      )
      return validationResults.every((result) => result)
    } catch (e) {
      console.error('[Enforma] Error validating form', e)
    } finally {
      formState.$isValidating.value = false
    }

    return false
  }

  function getArrayByPath(obj: any, arrayPath: string): any[] {
    return pathUtils.get(obj, arrayPath) as any[]
  }

  // Helper to trigger reactivity when needed
  const triggerUpdate = () => {
    formVersion.value++
  }

  async function _handleSetValue(
    path: string,
    value: any,
    validate = true,
    stateChanges: StateChanges = {}
  ): Promise<void> {
    const state = fieldManager.get(path)
    pathUtils.set(valuesRef.value, path, value)

    // Manually trigger reactivity since we're using shallowRef
    triggerUpdate()

    if (validate) {
      await validateField(path, state)
    }
    Object.entries(stateChanges).forEach(([key, val]) => {
      const stateKey = key as keyof FieldController
      ;(state[stateKey] as any).value = val
      if (key === '$isDirty' && val === true) {
        formState.$isDirty.value = true
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
        formState.$isSubmitting.value = true

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
            if (options.onValidationFail) {
              options.onValidationFail(formController)
            }

            // Emit validation error event
            formEmitter.emit('validation_fail', { formController })

            return false
          }

          if (options.submitHandler) {
            try {
              await options.submitHandler(valuesRef.value, formController)

              // Call submit success callback if provided
              if (options.onSubmitSuccess) {
                options.onSubmitSuccess(valuesRef.value)
              }

              formEmitter.emit('submit_success', { formController })
            } catch (error) {
              // Call submit error callback if provided
              if (options.onSubmitError) {
                options.onSubmitError(error, formController)
              }

              // Emit submit error event
              formEmitter.emit('submit_error', { error, formController })

              console.error('[Enforma] Error submitting form', error)
              return false
            }
          } else {
            // If no submit handler but form is valid, emit success
            formEmitter.emit('submit_success', { formController })
          }

          return true
        } finally {
          formState.$isSubmitting.value = false
        }
      },

      // Reset the business object to initial state
      reset(): void {
        const resetValues = config.behavior.cloneFn(valuesCopy)

        // Handle new keys that weren't in the original data
        Object.keys(valuesRef.value).forEach((key) => {
          if (resetValues && key in (resetValues as Record<string, any>)) {
            ;(valuesRef.value as Record<string, any>)[key] = (
              resetValues as Record<string, any>
            )[key]
          } else {
            // Reset to default empty values based on type
            ;(valuesRef.value as Record<string, any>)[key] = Array.isArray(
              (valuesRef.value as Record<string, any>)[key]
            )
              ? []
              : typeof (valuesRef.value as Record<string, any>)[key] ===
                  'object' &&
                (valuesRef.value as Record<string, any>)[key] !== null
              ? {}
              : null
          }
        })

        triggerUpdate() // Manual reactivity trigger

        // Clear all field states
        fieldManager.all().forEach((fieldController, path) => {
          try {
            // Check if the path still exists in the business object
            const value = pathUtils.get(valuesRef.value, path)

            // Path still exists, reset the state but keep the field registered
            fieldController.$errors.value = []
            fieldController.$isDirty.value = false
            fieldController.$isTouched.value = false
            fieldController.$isValidating.value = false
            // Preserve the ID
          } catch (e) {
            // If path resolution throws an error, the path is no longer valid
            fieldManager.delete(path)
          }
        })

        // Reset form-level state
        formState.$isDirty.value = false
        formState.$isTouched.value = false
        formState.$isValidating.value = false
        formState.$isSubmitting.value = false

        // Emit form reset event
        formEmitter.emit('form_reset', { formController: this })
      },

      // validation-related methods
      async validate(): Promise<boolean> {
        return await validateForm()
      },

      async validateField(path: string): Promise<boolean> {
        const state = fieldManager.get(path)
        return await validateField(path, state)
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

      errors(): object {
        const errors: Record<string, string[]> = {}
        fieldManager.all().forEach((fieldController, path) => {
          errors[path] = fieldController.$errors.value
        })
        return errors
      },

      getFieldErrors(path: string): string[] {
        const fieldController = fieldManager.get(path)
        return fieldController.$errors.value
      },

      // form value methods
      values(): object {
        return valuesRef.value
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

      getFieldValue(path: string): any {
        return pathUtils.get(valuesRef.value, path)
      },

      // field related methods.
      // these refer to items in the field manager, not the UI
      getField(path: string): FieldController {
        return fieldManager.get(path)
      },

      removeField(path: string): void {
        return fieldManager.delete(path)
      },

      hasField(path: string): boolean {
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

      // array-related methods
      add(arrayPath: string, index: number, item: any): void {
        const array = getArrayByPath(valuesRef.value, arrayPath) || []
        const len = array.length
        array.push(item)
        this.move(arrayPath, len, index)
        fieldManager.shift(arrayPath, index, 1)
        triggerUpdate() // Manual reactivity trigger
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
        triggerUpdate() // Manual reactivity trigger
      },

      move(arrayPath: string, fromIndex: number, toIndex: number): void {
        const array = getArrayByPath(valuesRef.value, arrayPath)
        moveArrayItem(array as [any], fromIndex, toIndex)
        fieldManager.move(arrayPath, fromIndex, toIndex)
        triggerUpdate() // Manual reactivity trigger
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
        triggerUpdate() // Manual reactivity trigger
      },

      // Enhanced cleanup with effectScope
      destroy(): void {
        // Clean up all form and field effects
        formScope.stop()
      },

      // Form-level ARIA attributes
      get $formAttrs() {
        const hasFormErrors = Array.from(fieldManager.all().values()).some(
          (field) => field.$errors.value.length > 0
        )

        return {
          'aria-busy': formState.$isSubmitting.value ? 'true' : undefined,
          'aria-invalid': hasFormErrors ? 'true' : undefined,
        }
      },
    } as unknown as FormController,
    {
      get(target: FormController, prop: string | symbol): any {
        if (typeof target[prop as keyof FormController] === 'function') {
          return target[prop as keyof FormController]
        }

        if (typeof prop === 'string') {
          // Vue internals
          if (prop.startsWith('__v_')) {
            return undefined
          }

          if (prop.startsWith('$')) {
            // Handle special case for formVersion
            // This is needed by repeatable fields
            // @see references to `form.$formVersion`
            if (prop === '$formVersion') {
              return formVersion.value
            }
            // Handle formAttrs
            if (prop === '$formAttrs') {
              return target.$formAttrs
            }
            return formState[prop as keyof typeof formState]
          }
          const isMetaProp = prop.includes('.$')
          if (isMetaProp) {
            const [path, metaProp] = prop.split('.$')
            const fieldController = fieldManager.get(path)

            switch (metaProp) {
              case 'isDirty':
              case 'errors':
              case 'isTouched':
              case 'isValidating':
                return computed(() => {
                  // @ts-expect-error the props we access are correct
                  return fieldController['$' + metaProp]?.value
                })
              case 'isValid':
                return computed(() => {
                  return fieldController.$errors.value.length === 0
                })
            }
          } else {
            fieldManager.get(prop) // to ensure the field exists
            // Add formVersion as dependency to computed properties
            const _ = formVersion.value // Add dependency
            const result = pathUtils.get(valuesRef.value, prop)
            return result
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
              ;(formState as any)[`$${metaProp}`].value = true
            }
          } else {
            // Set the value immediately
            pathUtils.set(valuesRef.value, prop, value)
            triggerUpdate() // Manual reactivity trigger
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
