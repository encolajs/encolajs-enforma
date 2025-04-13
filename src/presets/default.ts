import { DeepPartial, FormKitConfig, setGlobalConfig, getGlobalConfig } from '@/utils/useConfig'
import FormKitField from '@/core/FormKitField.vue'
import FormKitSection from '@/core/FormKitSection.vue'
import FormKitRepeatable from '@/core/FormKitRepeatable.vue'
import FormKitRepeatableTable from '@/core/FormKitRepeatableTable.vue'
import FormKitRepeatableAddButton from '@/core/FormKitRepeatableAddButton.vue'
import FormKitRepeatableRemoveButton from '@/core/FormKitRepeatableRemoveButton.vue'
import FormKitRepeatableMoveUpButton from '@/core/FormKitRepeatableMoveUpButton.vue'
import FormKitRepeatableMoveDownButton from '@/core/FormKitRepeatableMoveDownButton.vue'
import FormKitSubmitButton from '@/core/FormKitSubmitButton.vue'
import FormKitResetButton from '@/core/FormKitResetButton.vue'
import FormKitSchema from '@/core/FormKitSchema.vue'

/**
 * Default preset configuration options
 */
export interface DefaultPresetOptions {
  /** Override default components */
  components?: Partial<FormKitConfig['components']>
  /** Override default pass-through props */
  pt?: Partial<FormKitConfig['pt']>
}

/**
 * Applies the default preset to the global configuration
 * This function modifies the global configuration by merging the default preset
 * with the existing global configuration
 *
 * !!! It is not required if you're using only the headless components
 *
 * @param options Optional configuration options to customize the preset
 */
export default function useDefaultPreset(options: DefaultPresetOptions = {}): void {
  const currentConfig = getGlobalConfig()
  
  // Base default preset
  const defaultPreset: DeepPartial<FormKitConfig> = {
    pt: {
      wrapper: {
        class: 'formkit-field-wrapper',
      },
      wrapper__invalid: {
        class: 'formkit-field-invalid',
      },
      wrapper__required: {
        class: 'formkit-field-required',
      },
      label: {
        class: 'formkit-label',
      },
      required: {
        class: 'formkit-label-required',
        text: '*',
      },
      input: {
        class: 'formkit-input',
      },
      // Props for error messages
      error: {
        class: 'formkit-error',
      },
      help: {
        class: 'formkit-help',
      },
      repeatable: {
        wrapper: {
          class: 'formkit-repeatable',
        },
        items: {
          class: 'formkit-repeatable-items',
        },
        add: {
          class: 'formkit-repeatable-add-button',
        },
        remove: {
          class: 'formkit-repeatable-remove-button',
        },
        moveUp: {
          class: 'formkit-repeatable-move-up-button',
        },
        moveDown: {
          class: 'formkit-repeatable-move-down-button',
        },
        actions: {
          class: 'formkit-repeatable-actions',
        },
        itemActions: {
          class: 'formkit-repeatable-table-actions',
        },
      },
      repeatable_table: {
        table: {
          class: 'formkit-repeatable-table',
        },
        actionsTd: {
          class: 'formkit-repeatable-table-actions',
        },
      },
      section: {
        class: 'formkit-section',
      },
      ...options.pt,
    },
    components: {
      field: FormKitField,
      section: FormKitSection,
      repeatable: FormKitRepeatable,
      repeatableTable: FormKitRepeatableTable,
      repeatableAddButton: FormKitRepeatableAddButton,
      repeatableRemoveButton: FormKitRepeatableRemoveButton,
      repeatableMoveUpButton: FormKitRepeatableMoveUpButton,
      repeatableMoveDownButton: FormKitRepeatableMoveDownButton,
      submitButton: FormKitSubmitButton,
      resetButton: FormKitResetButton,
      schema: FormKitSchema,
      ...options.components,
    },
  }
  
  // Merge the current config with the default preset
  const mergedConfig = {
    ...currentConfig,
    pt: {
      ...currentConfig.pt,
      ...defaultPreset.pt,
    },
    components: {
      ...currentConfig.components,
      ...defaultPreset.components,
    },
  }
  
  // Set the global configuration
  setGlobalConfig(mergedConfig)
} 