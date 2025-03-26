import { computed, ComputedRef, ref, shallowRef, triggerRef } from 'vue'
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

  const add = async (newItem?: any, position?: number) => {
    if (!canAdd.value) return false

    const newValue = [...value.value]
    const insertAt =
      position !== undefined
        ? Math.min(position, newValue.length)
        : newValue.length

    // Insert new value
    newValue.splice(insertAt, 0, newItem ?? [])

    // Register new field to get an ID
    const newFieldPath = `${basePath}.${insertAt}`
    formState.registerField(newFieldPath)

    // Update form value
    formState.setFieldValue(basePath, newValue, 'blur') // to commit the values to the data source

    triggerUpdate()

    if (options.validateOnAdd) {
      // Validate the new item and all items after it
      for (let i = insertAt; i < newValue.length; i++) {
        const fieldPath = `${basePath}.${i}`
        await formState.validateField(fieldPath)
      }
    }

    return true
  }

  const remove = async (index: number) => {
    if (!canRemove.value) return false

    const oldIds = [...itemIds.value]
    const removedId = oldIds[index]

    // Remove item from array
    const newValue = value.value.filter((_, i) => i !== index)
    formState.setFieldValue(basePath, newValue, 'blur') // to commit the values to the data source

    // Cleanup the removed field's state
    formState.unregisterField(removedId)

    triggerUpdate()

    if (options.validateOnRemove) {
      // Validate fields after the removed index
      for (let i = index; i < newValue.length; i++) {
        const fieldPath = `${basePath}.${i}`
        await formState.validateField(fieldPath)
      }
    }

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

    for (let i = minIndex; i <= maxIndex; i++) {
      const fieldPath = `${basePath}.${i}`
      await formState.validateField(fieldPath)
    }

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

  // Cleanup function for component unmount
  const cleanup = () => {
    // Clean up all field states when repeatable is unmounted
    itemIds.value.forEach((id) => {
      formState.unregisterField(id)
    })
  }

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
    cleanup,
    count: value.value.length,
  }))
}
