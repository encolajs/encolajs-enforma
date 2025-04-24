// src/core/useEnformaRepeatable.ts
import { computed, inject, onBeforeUnmount } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { FieldSchema } from '@/types'

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
  showDeleteButton?: boolean // Whether to show the delete button
  showMoveButtons?: boolean // Whether to show the move up/down buttons
}

export interface RepeatableFieldConfig extends RepeatableFieldSchema {
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
  min?: number
}

export function useEnformaRepeatable(fieldConfig: RepeatableFieldConfig) {
  // Get form state from context
  const formState = inject<FormController>(formControllerKey) as FormController
  const { getConfig } = useFormConfig()

  if (!formState) {
    console.error(
      `EnformaRepeatable '${fieldConfig.name}' must be used within a Enforma form component`
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
        acc[subfieldName] = subfield
        return acc
      },
      {} as Record<string, any>
    )
  )

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
  }
}
