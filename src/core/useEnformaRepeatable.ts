// src/core/useEnformaRepeatable.ts
import { computed, inject, onBeforeUnmount, ComputedRef } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { FieldSchema } from '@/types'
import applyTransformers from '@/utils/applyTransformers'

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
  addButton?: any // EnformaRepeatableAddButton component
  removeButton?: any // EnformaRepeatableRemoveButton component
  moveUpButton?: any // EnformaRepeatableMoveUpButton component
  moveDownButton?: any // EnformaRepeatableMoveDownButton component
  allowAdd?: boolean // Whether to allow adding new items
  allowRemove?: boolean // Whether to allow removing items
  allowSort?: boolean // Whether to allow sorting items
}

export interface RepeatableFieldConfig extends RepeatableFieldSchema {
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
  min?: number
}

export function useEnformaRepeatable(originalFieldConfig: RepeatableFieldConfig) {
  // Get form state from context
  const formState = inject<FormController>(formControllerKey) as FormController
  const { formConfig, getConfig } = useFormConfig()

  if (!formState) {
    console.error(
      `EnformaRepeatable '${originalFieldConfig.name}' must be used within a Enforma form component`
    )
  }

  const { evaluateCondition } = useDynamicProps()

  // First, apply transformers to the repeatable field options
  const transformedFieldConfig = computed(() => {
    // Apply repeatable props transformers if defined in config
    const repeatablePropsTransformers = getConfig('transformers.repeatable_props', []) as Function[]
    
    if (repeatablePropsTransformers.length === 0) {
      return originalFieldConfig
    }
    
    // applyTransformers is now imported at the top
    
    return applyTransformers(
      repeatablePropsTransformers,
      { ...originalFieldConfig },
      formState,
      formConfig
    )
  })

  // Compute visibility state based on transformed props
  const isVisible = computed(() =>
    transformedFieldConfig.value.if !== undefined
      ? evaluateCondition(transformedFieldConfig.value.if).value
      : true
  )

  // Process subfields by removing the name property
  const fields = computed(() =>
    Object.entries(transformedFieldConfig.value.subfields || []).reduce(
      (acc, [subfieldName, subfield]) => {
        acc[subfieldName] = subfield
        return acc
      },
      {} as Record<string, any>
    )
  )

  // Clean up on unmount
  onBeforeUnmount(() => {
    formState?.removeField(transformedFieldConfig.value.name)
  })

  return {
    isVisible,
    fields,
    component: transformedFieldConfig.value.component,
    componentProps: transformedFieldConfig.value.componentProps,
    formState,
    getConfig,
    // Return the transformed config so the component can use all transformed props
    transformedFieldConfig,
  }
}
