import { computed, ComputedRef, onBeforeUnmount, onMounted, ref } from 'vue'
import { FormStateReturn } from '../types'

interface RepeatableOptions {
  min?: number
  max?: number
  validateOnAdd?: boolean
  validateOnRemove?: boolean
}

interface FieldState {
  oldPath: string
  newPath: string
  oldIndex: number
  newIndex: number
  isDirty: boolean
  isTouched: boolean
  error: string | null
  value: any
}

/**
 * Collects field states for items affected by an array operation
 */
function collectFieldStates(
  formState: FormStateReturn,
  basePath: string,
  minIndex: number,
  maxIndex: number = Infinity,
  getNewIndex: (oldIndex: number) => number
): Map<string, FieldState> {
  const states = new Map<string, FieldState>()

  // First pass: collect all states and determine old/new indices
  formState.pathToId.forEach((fieldId, path) => {
    if (path.startsWith(basePath + '.')) {
      const pathParts = path.split('.')
      // Find the array index part in the path
      const arrayIndexPosition = pathParts.findIndex(
        (part, idx) =>
          idx > 0 &&
          /^\d+$/.test(part) &&
          pathParts[idx - 1] === basePath.split('.').pop()
      )

      if (arrayIndexPosition !== -1) {
        const itemIndex = parseInt(pathParts[arrayIndexPosition])

        if (
          itemIndex >= minIndex &&
          (maxIndex === Infinity || itemIndex <= maxIndex)
        ) {
          const field = formState.fields.get(fieldId)
          if (field) {
            const newIndex = getNewIndex(itemIndex)

            if (newIndex !== -1) {
              // Create new path with the updated index
              const newPathParts = [...pathParts]
              newPathParts[arrayIndexPosition] = newIndex.toString()
              const newPath = newPathParts.join('.')

              states.set(path, {
                oldPath: path,
                newPath: newPath,
                oldIndex: itemIndex,
                newIndex: newIndex,
                isDirty: field.isDirty,
                isTouched: field.isTouched,
                error: field.error,
                value: field.value,
              })
            }
          }
        }
      }
    }
  })

  return states
}

/**
 * Determines the optimal order for applying field states to prevent overwriting
 */
function getOptimalApplyOrder(states: Map<string, FieldState>): string[] {
  const stateEntries = Array.from(states.entries())

  // Group by movement direction (up or down)
  const movingUp: [string, FieldState][] = []
  const movingDown: [string, FieldState][] = []
  const unchanged: [string, FieldState][] = []

  stateEntries.forEach((entry) => {
    const [_, state] = entry
    if (state.newIndex < state.oldIndex) {
      movingUp.push(entry)
    } else if (state.newIndex > state.oldIndex) {
      movingDown.push(entry)
    } else {
      unchanged.push(entry)
    }
  })

  // Sort movements:
  // For items moving up (to lower indices), process highest oldIndex first
  movingUp.sort((a, b) => b[1].oldIndex - a[1].oldIndex)

  // For items moving down (to higher indices), process lowest oldIndex first
  movingDown.sort((a, b) => a[1].oldIndex - b[1].oldIndex)

  // Combine the results in optimal order - unchanged can go anywhere
  return [
    ...movingUp.map(([path]) => path),
    ...movingDown.map(([path]) => path),
    ...unchanged.map(([path]) => path),
  ]
}
/**
 * Applies collected field states after an array operation
 */
function applyFieldStates(
  formState: FormStateReturn,
  states: Map<string, FieldState>
) {
  // Get the optimal order to apply the states
  const applyOrder = getOptimalApplyOrder(states)

  // Apply states in the determined order
  applyOrder.forEach((oldPath) => {
    const state = states.get(oldPath)
    if (!state) return

    // Clear errors for the old path
    if (formState.errors[oldPath]) {
      formState.errors[oldPath] = []
    }

    // Find the field at the new path and apply the state
    const fieldId = formState.pathToId.get(state.newPath)
    const field = fieldId ? formState.fields.get(fieldId) : undefined

    if (field) {
      field.isDirty = state.isDirty
      field.isTouched = state.isTouched
      field.value = state.value
      formState.setFieldValue(state.newPath, state.value, 'blur')
      formState.validateField(state.newPath, true)
    }
  })
}

export function useRepeatable(
  basePath: string,
  formState: FormStateReturn,
  options: RepeatableOptions = {}
) {
  if (!basePath) {
    throw new Error('Field name is required')
  }

  if (!formState) {
    throw new Error('Form state is required')
  }

  const fieldState =
    formState.getField(basePath) || formState.registerField(basePath)

  // Keep track of field ID for re-registration
  const fieldId = fieldState?.id

  // Track field IDs for the array items
  const itemIds = computed(() => {
    const arrayValue = formState.getFieldValue(basePath) || []
    return Array.isArray(arrayValue)
      ? arrayValue.map((_, index) => {
          const path = `${basePath}[${index}]`
          return formState.getField(path)?.id
        })
      : []
  })

  // this is needed so we can trigger recalculation of the value
  const updateTrigger = ref(0)

  // Get array value from form state
  const value: ComputedRef<any[]> = computed(() => {
    if (updateTrigger.value === null) {
      return []
    }
    const arrayValue = formState.getFieldValue(basePath) || []
    return Array.isArray(arrayValue) ? arrayValue : [arrayValue]
  })

  // Track fields for each array item
  const fields: ComputedRef<any[]> = computed(() =>
    itemIds.value.map((id, index) => {
      const fieldPath = `${basePath}.${index}`
      // Register with existing ID to preserve state
      return formState.getField(fieldPath)
    })
  )

  const canAdd = computed(
    () => !options.max || value.value.length < options.max
  )

  const canRemove = computed(
    () => !options.min || value.value.length > options.min
  )

  const triggerUpdate = () => {
    updateTrigger.value++
  }

  const validateItems = async (
    fromIndex: number,
    toIndex: number,
    onlyIfTouched: boolean = true,
    validateParent: boolean = false
  ) => {
    const validations: Promise<boolean>[] = []
    formState.fields.forEach((field, path) => {
      if (!path.startsWith(`${basePath}.`)) {
        return
      }
      for (let i = fromIndex; i <= toIndex; i++) {
        const fieldPath = `${basePath}.${i}`
        if (path.startsWith(fieldPath)) {
          validations.push(formState.validateField(fieldPath, onlyIfTouched))
        }
      }
    })
    if (validateParent) {
      validations.push(formState.validateField(basePath, false))
    }

    return await Promise.all(validations)
  }

  const add = async (newItem?: any, position?: number) => {
    if (!canAdd.value) return false

    const newValue = [...value.value]
    const insertAt =
      position !== undefined
        ? Math.min(position, newValue.length)
        : newValue.length

    // Insert new value
    newValue.splice(insertAt, 0, newItem ?? [])

    // Update form value
    formState.setFieldValue(basePath, newValue, 'blur') // to commit the values to the data source

    triggerUpdate()

    await validateItems(
      insertAt,
      newValue.length - 1,
      true,
      options.validateOnAdd
    )

    return true
  }

  const remove = async (index: number) => {
    if (!canRemove.value) return false

    const values: any[] = [...value.value]

    values.splice(index, 1)

    // Update the array value
    formState.setFieldValue(basePath, values, 'blur')
    triggerUpdate()

    // Validate affected fields
    const minIndex = Math.min(index, values.length - 1)
    const maxIndex = Math.max(index, values.length - 1)

    await validateItems(minIndex, maxIndex, true, options.validateOnRemove)

    formState.touchField(basePath)

    return true
  }

  const move = async (fromIndex: number, toIndex: number) => {
    const values = [...value.value]
    if (fromIndex === toIndex) return true

    const minIndex = Math.min(fromIndex, toIndex)
    const maxIndex = Math.max(fromIndex, toIndex)

    // Define how indices will map from old to new positions
    const getNewIndex = (oldIndex: number) => {
      if (oldIndex === fromIndex) return toIndex
      if (fromIndex < toIndex) {
        if (oldIndex > fromIndex && oldIndex <= toIndex) return oldIndex - 1
      } else {
        if (oldIndex >= toIndex && oldIndex < fromIndex) return oldIndex + 1
      }
      return oldIndex
    }

    // Collect states with new index calculation
    const states = collectFieldStates(
      formState,
      basePath,
      minIndex,
      maxIndex,
      getNewIndex
    )

    const [item] = values.splice(fromIndex, 1)
    values.splice(toIndex, 0, item)

    // Update the array value
    //formState.errors = {}
    applyFieldStates(formState, states)
    formState.setFieldValue(basePath, values)

    formState.touchField(basePath)
    await validateItems(minIndex, maxIndex, true, true)
    triggerUpdate()
  }

  const moveUp = async (index: number) => {
    if (index <= 0) return false
    return move(index, index - 1)
  }

  const moveDown = async (index: number) => {
    if (index >= value.value.length - 1) return false
    return move(index, index + 1)
  }

  // Register with existing ID
  onMounted(() => {
    formState.registerField(basePath, fieldId)
  })

  // Unregister path
  onBeforeUnmount(() => {
    formState.unregisterField(basePath)
    // Clean up all field states when repeatable is unmounted
    itemIds.value.forEach((id) => {
      formState.unregisterField(id)
    })
  })

  return computed(() => ({
    fields: fields.value,
    value: value.value,
    canAdd: canAdd.value,
    canRemove: canRemove.value,
    add,
    remove,
    move,
    moveUp,
    moveDown,
    count: value.value.length,
  }))
}
