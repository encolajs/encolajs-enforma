// src/core/useEnformaRepeatable.ts
import { computed, inject, onBeforeUnmount } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { FieldSchema } from '@/types'
import applyTransformers from '@/utils/applyTransformers'

/**
 * Repeatable field schema with subfields
 */
export interface RepeatableFieldProps {
  name: string
  min?: number
  max?: number
  subfields?: Record<string, FieldSchema>
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
  // these are here so that they are not passed to the top element
  type: any,
  rules: any,
  messages: any,
}

export function useEnformaRepeatable(
  originalFieldConfig: RepeatableFieldProps
) {
  // Get form state from context
  const formState = inject<FormController>(formControllerKey) as FormController
  const { formConfig, getConfig } = useFormConfig()

  if (!formState) {
    console.error(
      `[Enforma] EnformaRepeatable '${originalFieldConfig.name}' must be used within a Enforma form component`
    )
  }

  // First, apply transformers to the repeatable field options
  const transformedFieldConfig = computed(() => {
    // Apply repeatable props transformers if defined in config
    const repeatablePropsTransformers = getConfig(
      'transformers.repeatable_props',
      []
    ) as Function[]

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
    fields,
    component: transformedFieldConfig.value.component,
    componentProps: transformedFieldConfig.value.componentProps,
    formState,
    getConfig,
    // Return the transformed config so the component can use all transformed props
    transformedFieldConfig,
  }
}
