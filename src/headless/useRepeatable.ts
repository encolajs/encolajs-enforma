import { computed, ComputedRef, onMounted, ref } from 'vue'

import { FormController } from '@/types'

export interface RepeatableOptions {
  min?: number
  max?: number
  defaultValue?: any
  validateOnAdd?: boolean
  validateOnRemove?: boolean
}

export interface RepeatableController {
  value: any[]
  count: number
  canAdd: boolean
  canRemove: boolean
  add: (value?: any, index?: number) => Promise<boolean>
  remove: (index: number) => Promise<boolean>
  move: (fromIndex: number, toIndex: number) => Promise<boolean>
  moveUp: (index: number) => Promise<boolean>
  moveDown: (index: number) => Promise<boolean>
}

export function useRepeatable(
  name: string,
  form: FormController,
  options: RepeatableOptions = {}
): ComputedRef<RepeatableController> {
  const {
    min = 0,
    max = Infinity,
    defaultValue,
    validateOnAdd = false,
    validateOnRemove = false,
  } = options

  // Initialize fields
  const initializeFields = () => {
    // Ensure the form field exists for the array itself
    form.getField(name)

    // Initialize array or convert single value to array if needed
    const currentValues = form[name]
    if (currentValues === undefined) {
      // No values yet - initialize with empty array
      form[name] = []
    } else if (!Array.isArray(currentValues)) {
      // Convert non-array to array
      form[name] = [currentValues]
    } else {
      // Register all array item fields
      currentValues.forEach((_, index) => {
        form.getField(`${name}.${index}`)
      })
    }
  }

  // Call initialization immediately
  initializeFields()

  // Access array value through form proxy
  const value = computed(() => {
    const val = form[name]
    return Array.isArray(val) ? val : val ? [val] : []
  })

  const count = computed(() => value.value.length)
  const canAdd = computed(() => count.value < max)
  const canRemove = computed(() => count.value > min)

  const add = async (
    itemValue: any = defaultValue,
    index?: number
  ): Promise<boolean> => {
    if (!canAdd.value) return false

    const currentValue = [...value.value]
    const effectiveValue =
      typeof itemValue === 'function' ? itemValue() : itemValue

    if (index !== undefined) {
      currentValue.splice(index, 0, effectiveValue)
    } else {
      currentValue.push(effectiveValue)
    }

    // Update array in form
    form.add(name, index ?? currentValue.length - 1, effectiveValue)

    // Validate if needed
    if (validateOnAdd) {
      await form.validateField(name)
    }

    return true
  }

  const remove = async (index: number): Promise<boolean> => {
    if (!canRemove.value || index < 0 || index >= count.value) {
      return false
    }

    // Remove item from form
    form.remove(name, index)

    // Validate if needed
    if (validateOnRemove) {
      await form.validateField(name)
    }

    return true
  }

  const move = async (fromIndex: number, toIndex: number): Promise<boolean> => {
    if (
      fromIndex < 0 ||
      fromIndex >= count.value ||
      toIndex < 0 ||
      toIndex >= count.value ||
      fromIndex === toIndex
    ) {
      return false
    }

    // Move item in form
    form.move(name, fromIndex, toIndex)

    return true
  }

  const moveUp = async (index: number): Promise<boolean> => {
    if (index <= 0) return false
    return move(index, index - 1)
  }

  const moveDown = async (index: number): Promise<boolean> => {
    if (index >= count.value - 1) return false
    return move(index, index + 1)
  }

  return computed(() => ({
    value: value.value,
    count: count.value,
    canAdd: canAdd.value,
    canRemove: canRemove.value,
    add,
    remove,
    move,
    moveUp,
    moveDown,
  }))
}
