import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import EnformaField from '@/core/EnformaField.vue'
import EnformaSection from '@/core/EnformaSection.vue'
import EnformaRepeatable from '@/core/EnformaRepeatable.vue'
import EnformaRepeatableTable from '@/core/EnformaRepeatableTable.vue'
import EnformaRepeatableAddButton from '@/core/EnformaRepeatableAddButton.vue'
import EnformaRepeatableRemoveButton from '@/core/EnformaRepeatableRemoveButton.vue'
import EnformaRepeatableMoveUpButton from '@/core/EnformaRepeatableMoveUpButton.vue'
import EnformaRepeatableMoveDownButton from '@/core/EnformaRepeatableMoveDownButton.vue'
import EnformaSubmitButton from '@/core/EnformaSubmitButton.vue'
import EnformaResetButton from '@/core/EnformaResetButton.vue'
import EnformaSchema from '@/core/EnformaSchema.vue'

/**
 * Default preset configuration options
 */
export interface DefaultPresetOptions {
  /** Override default components */
  components?: Partial<EnformaConfig['components']>
  /** Override default pass-through props */
  pt?: Partial<EnformaConfig['pt']>
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
export default function useDefaultPreset(
  options: DefaultPresetOptions = {}
): void {
  const currentConfig = getGlobalConfig()

  // Base default preset
  const defaultPreset: DeepPartial<EnformaConfig> = {
    pt: {
      wrapper: {
        class: 'enforma-field-wrapper',
      },
      wrapper__invalid: {
        class: 'enforma-field-invalid',
      },
      wrapper__required: {
        class: 'enforma-field-required',
      },
      label: {
        class: 'enforma-label',
      },
      required: {
        class: 'enforma-label-required',
        text: '*',
      },
      input: {
        class: 'enforma-input',
      },
      // Props for error messages
      error: {
        class: 'enforma-error',
      },
      help: {
        class: 'enforma-help',
      },
      repeatable: {
        wrapper: {
          class: 'enforma-repeatable',
        },
        items: {
          class: 'enforma-repeatable-items',
        },
        item: {
          class: 'enforma-repeatable-item',
        },
        add: {
          class: 'enforma-repeatable-add-button',
        },
        remove: {
          class: 'enforma-repeatable-remove-button',
        },
        moveUp: {
          class: 'enforma-repeatable-move-up-button',
        },
        moveDown: {
          class: 'enforma-repeatable-move-down-button',
        },
        actions: {
          class: 'enforma-repeatable-actions',
        },
        itemActions: {
          class: 'enforma-repeatable-item-actions',
        },
      },
      repeatable_table: {
        table: {
          class: 'enforma-repeatable-table',
        },
        actionsTd: {
          class: 'enforma-repeatable-table-actions',
        },
      },
      section: {
        class: 'enforma-section',
      },
      ...options.pt,
    },
    components: {
      field: EnformaField,
      section: EnformaSection,
      repeatable: EnformaRepeatable,
      repeatableTable: EnformaRepeatableTable,
      repeatableAddButton: EnformaRepeatableAddButton,
      repeatableRemoveButton: EnformaRepeatableRemoveButton,
      repeatableMoveUpButton: EnformaRepeatableMoveUpButton,
      repeatableMoveDownButton: EnformaRepeatableMoveDownButton,
      submitButton: EnformaSubmitButton,
      resetButton: EnformaResetButton,
      schema: EnformaSchema,
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
