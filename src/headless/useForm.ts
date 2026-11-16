import {
  FocusTarget,
  FormController,
  FormOptions,
  PendingHandle,
  ValidationRules,
} from '@/types'
import { useValidation } from '@/utils/useValidation'
import {
  computed,
  Ref,
  ref,
  shallowRef,
  effectScope,
  EffectScope,
  watchEffect,
  inject,
  getCurrentInstance,
} from 'vue'
import * as Vue from 'vue'
import { generateId, isPlainObject, pathUtils } from '@/utils/helpers'
import { isDeepEqual } from '@/utils/isDeepEqual'
import { useConfig } from '@/utils/useConfig'
import { Emitter, FormEvents, createFormEmitter } from '@/utils/events'
import moveArrayItem from '@/utils/moveArrayItem'
import type { FormValidator } from '@/validators/types'
import { NoopValidator } from '@/validators/NoopValidator'
import { isFormValidator, isRulesObject } from '@/validators/helpers'
import {
  enformaConfigKey,
  formControllerSelfKey,
  formFocusTargetsKey,
} from '@/constants/symbols'
import { warnRulesDeprecation } from '@/utils/deprecationWarnings'

export interface FieldController {
  $errors: Ref<string[]>
  $isDirty: Ref<boolean>
  $isTouched: Ref<boolean>
  $isValidating: Ref<boolean>
  /** Whether work registered for the field (beginPending(), track()) is still running */
  $isPending: Ref<boolean>
  _id: string
}

/** Work registered with beginPending(): the field it's for, or null for the form's own */
interface PendingWork {
  state: FieldController | null
  controller: AbortController
}

/** Why dropped work's signal aborted: an AbortError, also where `signal.reason` is missing */
function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The work was dropped', 'AbortError')
}

/** Whether a value is what reset() gives a key the saved values lack: null, [] or {} */
function isBlank(value: any): boolean {
  if (value === undefined || value === null) return true
  if (Array.isArray(value)) return value.length === 0
  return isPlainObject(value) && Object.keys(value).length === 0
}

/**
 * Whether the form's values are the saved ones. A key the saved values lack is unchanged
 * while it holds what reset() gives it
 */
function sameValues(current: any, saved: any): boolean {
  if (!isPlainObject(current) || !isPlainObject(saved)) {
    return isDeepEqual(current, saved)
  }
  const keys = new Set([...Object.keys(current), ...Object.keys(saved)])
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(saved, key)) {
      if (!isDeepEqual(current[key], saved[key])) return false
    } else if (!isBlank(current[key])) {
      return false
    }
  }
  return true
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
  // Called with a field's state as it leaves its path: deleted, or moved to another one
  private _onLeave: (state: FieldController) => void

  constructor(onLeave: (state: FieldController) => void = () => {}) {
    this._fields = new Map<string, FieldController>()
    this._fieldScopes = new Map<string, EffectScope>()
    this._onLeave = onLeave
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
    const state = this._fields.get(path)
    this._fields.delete(path)
    if (state) this._onLeave(state)
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
          $isPending: ref(false),
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
            if (offset !== 0) this._onLeave(state)
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
        this._onLeave(state)
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
          if (newIndex !== oldIndex) this._onLeave(state)
        }
      } else {
        newStates.set(path, state)
      }
    }

    this._fields = newStates
  }
}

// Vue's useId(), from Vue 3.5 on. Read off the module, as an import would fail on older Vue
const vueUseId = (Vue as Record<string, any>).useId as
  | (() => string)
  | undefined
let formCount = 0

/**
 * An id for a form given none. In a component on Vue 3.5+ it's useId()'s, which the server and
 * the browser make up alike; otherwise a count's, so a server-rendered form needs an `id`.
 */
function makeFormId(): string {
  if (vueUseId && getCurrentInstance()) return `enforma-${vueUseId()}`
  return `enforma-${++formCount}`
}

export function useForm<T extends object>(
  values: object,
  validatorOrRules?: FormValidator | ValidationRules,
  options: FormOptions = {}
): T & FormController {
  // The form's id, which is the <form>'s, set once
  const formId = options.id || makeFormId()

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
  let savedVersion: any
  let validator: any
  // The work registered with beginPending() that hasn't been released yet
  const pendingWork = new Set<PendingWork>()
  let pendingCount: Ref<number>

  formScope.run(() => {
    // Create form-specific event emitter
    formEmitter = createFormEmitter()

    // Use form config to access the clone function
    config = useConfig()
    const enformaConfig = inject(enformaConfigKey, null) as any

    if (validatorOrRules) {
      if (isFormValidator(validatorOrRules)) {
        validator = validatorOrRules
      } else if (isRulesObject(validatorOrRules)) {
        // Show deprecation warning
        warnRulesDeprecation('useForm')

        if (options.validatorFactory) {
          validator = options.validatorFactory.make(validatorOrRules, {
            ...(options.customMessages || {}),
          })
        } else if (enformaConfig?.createEncolaValidation) {
          validator = enformaConfig.createEncolaValidation(
            validatorOrRules,
            options.customMessages
          )
        } else {
          const validationFactory = useValidation().factory
          validator = validationFactory.make(validatorOrRules, {
            ...(options.customMessages || {}),
          })
        }
      }
    } else {
      validator = new NoopValidator()
    }

    cloneFn = config.behavior.cloneFn
    valuesCopy = cloneFn(values)
    // A field's work is dropped as the field leaves its path: removed, or its row moved
    fieldManager = new FieldManager(dropFieldWork)
    // Use shallowRef for performance with large/complex data
    valuesRef = shallowRef(values)
    formVersion = ref(0) // Manual reactivity trigger
    savedVersion = ref(0) // Bumped as commit() saves the values
    pendingCount = ref(0)
    formState = {
      $isValidating: ref(false),
      $isSubmitting: ref(false),
      $isDirty: ref(false),
      $isTouched: ref(false),
      // Whether the values differ from the saved ones (those given, or commit()'s), false
      // again when the user undoes a change
      $isChanged: computed(() => {
        void formVersion.value
        void savedVersion.value
        return !sameValues(valuesRef.value, valuesCopy)
      }),
      // Whether any registered work (beginPending(), track()) is still running
      $isPending: computed(() => pendingCount.value > 0),
    }

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

  /**
   * Checks a field, then its dirty dependants (the fields whose rules name it), each
   * once: `checked` holds the fields this round has checked, so two fields whose rules
   * name each other (a password and its repeat) don't check each other forever.
   */
  async function validateField(
    path: string,
    fieldController: FieldController,
    checked: Set<string> = new Set()
  ): Promise<boolean> {
    if (!validator) return true
    checked.add(path)

    try {
      fieldController.$isValidating.value = true
      fieldController.$isTouched.value = true
      fieldController.$isDirty.value = true

      const isValid = await validator.validatePath(path, valuesRef.value)
      await Promise.all(
        validator.getDependentFields(path).map((dependant: string) => {
          // A dependant with no state, such as a field hidden by its `if`, isn't
          // mounted: getting one would create it, and validate() would then check it
          if (checked.has(dependant) || !fieldManager.has(dependant)) return
          const depCtrl = fieldManager.get(dependant)
          if (depCtrl.$isDirty.value && !depCtrl.$isValidating.value) {
            return validateField(dependant, depCtrl, checked)
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

  /** The focus targets of the form's fields (@see formFocusTargetsKey) */
  const focusTargets = new Set<FocusTarget>()

  /** The target answering for `path`: the last one registered for it */
  function focusTargetFor(path: string): FocusTarget | undefined {
    let found: FocusTarget | undefined
    for (const target of focusTargets) {
      if (target.path() === path) found = target
    }
    return found
  }

  /** The paths of the targets that have an element, in the order they are on the page */
  function pathsInPageOrder(): string[] {
    const placed: Array<{ path: string; element: Element }> = []
    for (const target of focusTargets) {
      const element = target.element()
      if (element && typeof element.compareDocumentPosition === 'function') {
        placed.push({ path: target.path(), element })
      }
    }
    return placed
      .sort((a, b) => {
        if (a.element === b.element) return 0
        // DOCUMENT_POSITION_FOLLOWING: b comes after a (also when a contains b)
        return a.element.compareDocumentPosition(b.element) & 4 ? -1 : 1
      })
      .map(({ path }) => path)
  }

  /**
   * The fields that have errors, in the order they are on the page (those whose field has an
   * element), then in the order they render (`fieldOrder`), a repeatable's items where the
   * repeatable is; those neither lists last, in the order the form got them
   */
  function failingPaths(): string[] {
    const failing = Array.from(fieldManager.all().entries())
      .filter(([, state]) => state.$errors.value.length > 0)
      .map(([path]) => path)
    const order = [...pathsInPageOrder(), ...(options.fieldOrder?.() ?? [])]
    if (order.length === 0) return failing
    const rank = (path: string) => {
      const at = order.findIndex(
        (listed) => path === listed || path.startsWith(`${listed}.`)
      )
      return at === -1 ? order.length : at
    }
    return failing
      .map((path, at) => ({ path, at, rank: rank(path) }))
      .sort((a, b) => a.rank - b.rank || a.at - b.at)
      .map(({ path }) => path)
  }

  /** Whether a field has registered work that is still running */
  function hasWork(state: FieldController): boolean {
    for (const work of pendingWork) {
      if (work.state === state) return true
    }
    return false
  }

  function addWork(work: PendingWork): void {
    pendingWork.add(work)
    pendingCount.value = pendingWork.size
    if (work.state) work.state.$isPending.value = true
  }

  /** Stops counting the work; a second call does nothing */
  function releaseWork(work: PendingWork): void {
    if (!pendingWork.delete(work)) return
    pendingCount.value = pendingWork.size
    if (work.state) work.state.$isPending.value = hasWork(work.state)
  }

  /** Releases the work and aborts its signal: the work is no longer the form's to wait for */
  function dropWork(work: PendingWork): void {
    releaseWork(work)
    work.controller.abort()
  }

  /** Drops the field's work */
  function dropFieldWork(state: FieldController): void {
    Array.from(pendingWork)
      .filter((work) => work.state === state)
      .forEach(dropWork)
  }

  /** Drops all the work registered: the form's own, and every field's */
  function dropAllWork(): void {
    Array.from(pendingWork).forEach(dropWork)
  }

  function beginPending(path?: string): PendingHandle {
    const work: PendingWork = {
      state: path === undefined ? null : fieldManager.get(path),
      controller: new AbortController(),
    }
    addWork(work)
    return {
      done: () => releaseWork(work),
      signal: work.controller.signal,
    }
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
        // The form waits for its pending work (an upload) before it submits
        if (formState.$isPending.value) return false

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
            // The fields that failed, in the order they render
            const paths = failingPaths()

            // Call validation error callback if provided
            if (options.onValidationFail) {
              options.onValidationFail(formController, paths)
            }

            // Emit validation error event
            formEmitter.emit('validation_fail', { formController, paths })

            return false
          }

          // Work may have begun while the form validated
          if (formState.$isPending.value) return false

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

      // Registers work the form waits for: while it runs, the form and the field at `path`
      // (the form itself without one) are pending
      beginPending(path?: string): PendingHandle {
        return beginPending(path)
      },

      // Registers the promise as work the form waits for, until it settles. Given a function,
      // calls it with the work's signal for the promise
      track<T>(
        work: Promise<T> | ((signal: AbortSignal) => Promise<T>),
        path?: string
      ): Promise<T> {
        const { done, signal } = beginPending(path)
        let promise: Promise<T>
        try {
          promise = typeof work === 'function' ? work(signal) : work
        } catch (error) {
          done()
          return Promise.reject(error)
        }
        return new Promise<T>((resolve, reject) => {
          // Dropped work rejects at once, whenever its promise settles
          const onAbort = () => reject(abortReason(signal))
          signal.addEventListener('abort', onAbort, { once: true })
          Promise.resolve(promise)
            .then(resolve, reject)
            .finally(() => {
              signal.removeEventListener('abort', onAbort)
              done()
            })
        })
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

        // The work running for the values reset() discards is no longer waited for
        dropAllWork()

        // Reset form-level state
        formState.$isDirty.value = false
        formState.$isTouched.value = false
        formState.$isValidating.value = false
        formState.$isSubmitting.value = false

        // Emit form reset event
        formEmitter.emit('form_reset', { formController: this })
      },

      // The current values, or `values`, become the saved ones: those reset() returns to,
      // which $isChanged compares with. The fields' states clear, as reset() clears them
      commit(values?: object): void {
        valuesCopy = cloneFn(values === undefined ? valuesRef.value : values)
        savedVersion.value++

        fieldManager.all().forEach((fieldController) => {
          fieldController.$errors.value = []
          fieldController.$isDirty.value = false
          fieldController.$isTouched.value = false
          fieldController.$isValidating.value = false
        })
        formState.$isDirty.value = false
        formState.$isTouched.value = false
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

      focusField(path: string): boolean {
        const request = {
          path,
          formController: formController as FormController,
          handled: false,
        }
        formEmitter.emit('field_focus_requested', request)
        const target = focusTargetFor(path)
        if (target) void target.focus()
        return !!target || request.handled
      },

      focusFirstError(): boolean {
        return failingPaths().some((path) => formController.focusField(path))
      },

      // Registers what answers focusField() for a path and places it on the page: an Enforma
      // field. Gives the function that removes it
      [formFocusTargetsKey](target: FocusTarget): () => void {
        focusTargets.add(target)
        return () => {
          focusTargets.delete(target)
        }
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

      // The controller itself, for <Enforma>, which reaches it through a ref to its HeadlessForm
      // (@see formControllerSelfKey)
      [formControllerSelfKey](): FormController {
        return formController
      },

      // Enhanced cleanup with effectScope
      destroy(): void {
        // Clean up all form and field effects
        formScope.stop()
      },

      get $formId() {
        return formId
      },

      // The <form>'s attributes: its id and its ARIA attributes
      get $formAttrs() {
        const hasFormErrors = Array.from(fieldManager.all().values()).some(
          (field) => field.$errors.value.length > 0
        )

        return {
          id: formId,
          'aria-busy':
            formState.$isSubmitting.value || formState.$isPending.value
              ? 'true'
              : undefined,
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
            if (prop === '$formAttrs' || prop === '$formId') {
              return target[prop]
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
              case 'isPending':
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

      // The form's methods and state are "in" the controller, so a ref to the component that
      // exposes it (Vue's expose proxy checks `key in` before reading) reads them. Field values
      // are not: they're read with getFieldValue()
      has(target: FormController, prop: string | symbol): boolean {
        if (prop in target) return true
        return (
          typeof prop === 'string' &&
          (prop in formState || prop === '$formVersion')
        )
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
