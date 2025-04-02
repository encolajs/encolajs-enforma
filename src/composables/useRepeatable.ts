import { computed, ComputedRef, onBeforeUnmount, onMounted, ref} from 'vue'
import { FormStateReturn } from '../types'

interface RepeatableOptions {
  min?: number
  max?: number
  validateOnAdd?: boolean
  validateOnRemove?: boolean
}

interface FieldState {
  oldPath: string
  isDirty: boolean
  isTouched: boolean
  isVisited: boolean
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
  maxIndex: number = Infinity
): Map<string, FieldState> {
  const states = new Map<string, FieldState>()

  formState.pathToId.forEach((fieldId, path) => {
    if (path.startsWith(basePath + '.')) {
      const pathParts = path.split('.')
      const itemIndex = parseInt(pathParts[pathParts.length - 2])

      if (itemIndex >= minIndex && (maxIndex === Infinity || itemIndex <= maxIndex)) {
        const field = formState.fields.get(fieldId)
        if (field) {
          states.set(path, {
            oldPath: path,
            isDirty: field.isDirty,
            isTouched: field.isTouched,
            isVisited: field.isVisited,
            error: field.error,
            value: field.value
          })
        }
      }
    }
  })

  return states
}

/**
 * Applies collected field states after an array operation
 */
function applyFieldStates(
  formState: FormStateReturn,
  basePath: string,
  states: Map<string, FieldState>,
  getNewIndex: (oldIndex: number) => number
) {
  // Get current fields after array operation
  const currentPaths = new Set<string>()
  formState.pathToId.forEach((_, path) => {
    if (path.startsWith(basePath + '.')) {
      currentPaths.add(path)
    }
  })
  // Map old paths to new paths
  const pathMap = new Map<string, string>()
  states.forEach((state, oldPath) => {
    const pathParts = oldPath.split('.')
    const oldIndex = parseInt(pathParts[pathParts.length - 2])
    const newIndex = getNewIndex(oldIndex)
    if (newIndex !== -1) {
      pathParts[pathParts.length - 2] = newIndex.toString()
      const newPath = pathParts.join('.')
      formState.errors[oldPath] = []
      pathMap.set(oldPath, newPath)
    }
  })

  // Apply states to new fields
  currentPaths.forEach(newPath => {
    // Find the old path that maps to this new path
    for (const [oldPath, mappedNewPath] of pathMap.entries()) {
      if (mappedNewPath === newPath) {
        const state = states.get(oldPath)
        if (state) {
          const fieldId = formState.pathToId.get(newPath)
          const field = fieldId ? formState.fields.get(fieldId) : undefined
          if (field) {
            field.isDirty = state.isDirty
            field.isTouched = state.isTouched
            field.isVisited = state.isVisited
            field.error = state.error
            field.value = state.value
          }
        }
        break
      }
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

  const fieldState = formState.getField(basePath) || formState.registerField(basePath)

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

  const validateItems = async (fromIndex: number, toIndex: number, onlyIfTouched: boolean = true, validateParent: boolean = false) => {
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

    await validateItems(insertAt, newValue.length - 1, true, options.validateOnAdd)

    return true
  }

  const remove = async (index: number) => {
    if (!canRemove.value) return false

    const values: any[] = value.value

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
    const values = value.value
    if (fromIndex === toIndex) return true

    const minIndex = Math.min(fromIndex, toIndex)
    const maxIndex = Math.max(fromIndex, toIndex)
    const states = collectFieldStates(formState, basePath, minIndex, maxIndex)

    const [item] = values.splice(fromIndex, 1)
    values.splice(toIndex, 0, item)

    const getNewIndex = (oldIndex: number) => {
      if (oldIndex === fromIndex) return toIndex
      if (fromIndex < toIndex) {
        if (oldIndex > fromIndex && oldIndex <= toIndex) return oldIndex - 1
      } else {
        if (oldIndex >= toIndex && oldIndex < fromIndex) return oldIndex + 1
      }
      return oldIndex
    }
    applyFieldStates(formState, basePath, states, getNewIndex)

    // Update the array value
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
