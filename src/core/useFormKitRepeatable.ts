// src/core/useFormKitRepeatable.ts
import { computed, inject, onBeforeUnmount } from 'vue'
import { formStateKey } from '@/constants/symbols'
import { useDynamicProps } from '@/utils/useDynamicProps'
import { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { FieldSchema } from '@/types'

/**
 * Repeatable field schema with subfields
 */
export interface RepeatableFieldSchema {
  type: 'repeatable'
  name: string
  min?: number
  max?: number
  subfields: Record<string, FieldSchema>
  defaultValue?: any
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
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
    Object.entries(fieldConfig.subfields).reduce(
      (acc, [subfieldName, subfield]) => {
        const { name, ...rest } = subfield
        acc[subfieldName] = rest
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
    formState,
    getConfig,
  }
}
