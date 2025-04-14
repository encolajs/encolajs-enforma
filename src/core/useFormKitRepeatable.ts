// src/core/useFormKitRepeatable.ts
import { computed, inject, onBeforeUnmount } from 'vue'
import { formStateKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { FieldSchema } from '@/types'

/**
 * Animation options for repeatable fields
 */
export interface RepeatableAnimationOptions {
  enabled?: boolean
  duration?: number
  easing?: string
  add?: boolean
  remove?: boolean
  move?: boolean
}

/**
 * Props passed to the component when using component-based subfields
 */
export interface RepeatableComponentProps {
  name: string
  index: number
  value: any
  listLength: number // Total number of items in the repeatable
}

/**
 * Repeatable field schema with subfields
 */
export interface RepeatableFieldSchema {
  type: 'repeatable'
  name: string
  min?: number
  max?: number
  subfields?: Record<string, FieldSchema>
  component?: any // Component to use for rendering subfields
  componentProps?: Record<string, any> // Additional props to pass to the component
  defaultValue?: any
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
  animations?: boolean | RepeatableAnimationOptions
  addButton?: any // FormKitRepeatableAddButton component
  removeButton?: any // FormKitRepeatableRemoveButton component
  moveUpButton?: any // FormKitRepeatableMoveUpButton component
  moveDownButton?: any // FormKitRepeatableMoveDownButton component
}

export interface RepeatableFieldConfig extends RepeatableFieldSchema {
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
  min?: number
}

export function useFormKitRepeatable(fieldConfig: RepeatableFieldConfig) {
  // Get form state from context
  const formState = inject<FormController>(formStateKey) as FormController
  const { getConfig } = useFormConfig()

  if (!formState) {
    console.error(
      `FormKitRepeatable '${fieldConfig.name}' must be used within a FormKit form component`
    )
  }

  const { evaluateCondition } = useDynamicProps()

  // Compute visibility state
  const isVisible = computed(() =>
    fieldConfig.if !== undefined
      ? evaluateCondition(fieldConfig.if).value
      : true
  )

  // Process subfields by removing the name property
  const fields = computed(() =>
    Object.entries(fieldConfig.subfields || []).reduce(
      (acc, [subfieldName, subfield]) => {
        const { name, ...rest } = subfield
        acc[subfieldName] = rest
        return acc
      },
      {} as Record<string, any>
    )
  )


  // Process animation options
  const animationOptions = computed<RepeatableAnimationOptions>(() => {
    // Default animation settings
    const defaults = {
      enabled: true,
      duration: 300,
      easing: 'ease',
      add: true,
      remove: true,
      move: true,
    }

    // Handle boolean animations prop
    if (typeof fieldConfig.animations === 'boolean') {
      return {
        ...defaults,
        enabled: fieldConfig.animations,
      }
    }

    // Handle object animations prop
    if (fieldConfig.animations && typeof fieldConfig.animations === 'object') {
      return {
        ...defaults,
        ...fieldConfig.animations,
      }
    }

    // Default when not specified
    return defaults
  })

  // Determine if animations should be used
  const useAnimations = computed(() => {
    return animationOptions.value.enabled
  })

  // Generate animation style variables
  const animationStyles = computed(() => {
    if (!useAnimations.value) return {}

    return {
      '--repeatable-animation-duration': `${animationOptions.value.duration}ms`,
      '--repeatable-animation-easing': animationOptions.value.easing,
    }
  })

  // Clean up on unmount
  onBeforeUnmount(() => {
    formState?.removeField(fieldConfig.name)
  })

  return {
    isVisible,
    fields,
    component: fieldConfig.component,
    componentProps: fieldConfig.componentProps,
    formState,
    getConfig,
    useAnimations,
    animationOptions,
    animationStyles,
  }
}
