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
  repeatableAttrs: Record<string, any>
  getItemAttrs: (index: number) => Record<string, any>
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

  // Function to announce changes to screen readers
  const announceArrayChange = (
    action: 'added' | 'removed' | 'moved',
    index: number
  ) => {
    const announcement = {
      added: `Item added at position ${index + 1}`,
      removed: `Item removed from position ${index + 1}`,
      moved: `Item moved to position ${index + 1}`,
    }[action]

    announceToScreenReader(announcement)
  }

  const announceToScreenReader = (message: string) => {
    if (typeof document === 'undefined') return // SSR safety

    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)
    setTimeout(() => {
      try {
        document.body.removeChild(liveRegion)
      } catch {
        // Element might already be removed
      }
    }, 1000)
  }

  // Access array value through form proxy
  const value = computed(() => {
    // Explicitly depend on formVersion to ensure reactivity
    const _ = form.$formVersion
    const val = form[name]
    return Array.isArray(val) ? val : val ? [val] : []
  })

  const count = computed(() => {
    // Explicitly depend on formVersion to ensure reactivity
    const _ = form.$formVersion
    return value.value.length
  })

  const canAdd = computed(() => {
    // Explicitly depend on formVersion to ensure reactivity
    const _ = form.$formVersion
    return count.value < max
  })

  const canRemove = computed(() => {
    // Explicitly depend on formVersion to ensure reactivity
    const _ = form.$formVersion
    return count.value > min
  })

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
    const addIndex = index ?? currentValue.length - 1
    form.add(name, addIndex, effectiveValue)

    // Announce the change
    announceArrayChange('added', addIndex)

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

    // Announce the change
    announceArrayChange('removed', index)

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

    // Announce the change
    announceArrayChange('moved', toIndex)

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

  // ARIA attributes for the repeatable container
  const repeatableAttrs = computed(() => {
    const _ = form.$formVersion // Depend on form version for reactivity
    return {
      'aria-live': 'polite',
      'aria-label': `${count.value} items`,
      role: 'group',
    }
  })

  // Function to get ARIA attributes for individual array items
  const getItemAttrs = (index: number) => {
    const _ = form.$formVersion // Depend on form version for reactivity
    return {
      'aria-setsize': count.value,
      'aria-posinset': index + 1,
      'aria-describedby': `item-help-${name}-${index}`,
      role: 'group',
      'aria-label': `Item ${index + 1} of ${count.value}`,
    }
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
    repeatableAttrs: repeatableAttrs.value,
    getItemAttrs,
  }))
}
