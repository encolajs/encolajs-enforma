// src/core/useFormKitRepeatable.ts
import { inject, onBeforeUnmount, computed } from 'vue'
import { formConfigKey, formStateKey } from '../constants/symbols'
import { FormKitConfig } from '../types/config'
import { useDynamicProps } from '../utils/useDynamicProps'
import { FormController } from '@/types'
import { RepeatableFieldSchema } from '../types/fields'

export interface RepeatableFieldConfig extends RepeatableFieldSchema {
  validateOnAdd?: boolean
  validateOnRemove?: boolean
  if?: boolean
  min?: number
}

export function useFormKitRepeatable(fieldConfig: RepeatableFieldConfig) {
  // Get form state from context
  const formState = inject<FormController>(formStateKey) as FormController
  const config = inject<FormKitConfig>(formConfigKey) as FormKitConfig

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
    config,
  }
}
