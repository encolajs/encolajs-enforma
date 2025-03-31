import { computed, ComputedRef, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef } from 'vue'
import { FormStateReturn } from '../types'

interface RepeatableOptions {
  min?: number
  max?: number
  validateOnAdd?: boolean
  validateOnRemove?: boolean
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

  const validateItems = async (fromIndex: number, toIndex: number, onlyIfTouched: boolean = true) => {
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

    await validateItems(insertAt, newValue.length - 1, false)
    if (options.validateOnAdd) {
      await formState.validateField(basePath, false)
    }

    return true
  }

  const remove = async (index: number) => {
    if (!canRemove.value) return false

    const values = value.value

    values.splice(index, 1)

    // Update the array value
    formState.setFieldValue(basePath, values, 'blur')
    triggerUpdate()

    // Validate affected fields
    const minIndex = Math.min(index, values.length - 1)
    const maxIndex = Math.max(index, values.length - 1)

    await validateItems(minIndex, maxIndex, true)
    if (options.validateOnRemove) {
      await formState.validateField(basePath, false)
    }

    formState.touchField(basePath)

    return true
  }

  const move = async (fromIndex: number, toIndex: number) => {
    const values = value.value
    if (fromIndex === toIndex) return true

    const [item] = values.splice(fromIndex, 1)
    values.splice(toIndex, 0, item)

    // Update the array value
    formState.setFieldValue(basePath, values, 'blur')
    triggerUpdate()

    // Validate affected fields
    const minIndex = Math.min(fromIndex, toIndex)
    const maxIndex = Math.max(fromIndex, toIndex)

    await validateItems(minIndex, maxIndex, false)

    formState.touchField(basePath)
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
