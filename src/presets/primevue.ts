import SubmitButton from './primevue/SubmitButton.vue'
import ResetButton from './primevue/ResetButton.vue'
import { InputText, Select } from 'primevue'
import { FieldController, FormController } from '@/types'
import { DeepPartial, FormKitConfig, setGlobalConfig, getGlobalConfig } from '@/utils/useConfig'

const fieldMap: Record<string, any> = {
  input: InputText,
  select: Select,
}

function fieldPropsTransformer(
  fieldProps: any,
  field: FieldController,
  formState: FormController,
  config: any
) {
  fieldProps.input.labelId = field.value.id
  fieldProps.input.modelValue = field.value.value
  fieldProps.component = fieldMap[fieldProps.component] || InputText
  return fieldProps
}

/**
 * Applies the PrimeVue preset to the global configuration
 * This function modifies the global configuration by merging the PrimeVue preset
 * with the existing global configuration
 */
export default function usePrimeVuePreset(): void {
  const currentConfig = getGlobalConfig()
  
  const primeVuePreset: DeepPartial<FormKitConfig> = {
    pt: {
      actions: {
        class: 'flex gap-2'
      },
      error: {
        class: 'text-red-500'
      }
    },
    components: {
      submitButton: SubmitButton,
      resetButton: ResetButton,
    },
    transformers: {
      field_props: [fieldPropsTransformer],
    },
  }
  
  // Merge the current config with the PrimeVue preset
  const mergedConfig = {
    ...currentConfig,
    pt: {
      ...currentConfig.pt,
      ...primeVuePreset.pt,
    },
    components: {
      ...currentConfig.components,
      ...primeVuePreset.components,
    },
    transformers: {
      ...currentConfig.transformers,
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(primeVuePreset.transformers?.field_props || []),
      ],
    },
  }
  // Set the global configuration
  setGlobalConfig(mergedConfig)
}