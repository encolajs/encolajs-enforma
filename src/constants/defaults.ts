import { type messageFormatter } from '@encolajs/validator'
/**
 * Default configuration values for the form kit
 */

import { EnformaConfig } from '@/utils/useConfig'
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
 * Minimal default configuration for the form kit
 * This contains only the essential options needed for the form kit to work
 * Additional configuration is provided by presets
 */
export const DEFAULT_CONFIG: EnformaConfig = {
  /**
   * Default behavior configuration
   */
  behavior: {
    validateOn: 'blur',
  },

  /**
   * Configuration for the expressions that are being
   * used in the form schema (eg: disabled: "${form.name === 'Cage'}")
   */
  expressions: {
    delimiters: {
      start: '${',
      end: '}',
    },
  },

  /**
   * Empty components configuration
   * Components will be provided by presets
   */
  components: {
    field: null,
    section: null,
    repeatable: null,
    repeatableTable: null,
    repeatableAddButton: null,
    repeatableRemoveButton: null,
    repeatableMoveUpButton: null,
    repeatableMoveDownButton: null,
    submitButton: null,
    resetButton: null,
    schema: null,
  },

  /**
   * Empty pass-through configuration
   * Pass-through props will be provided by presets
   */
  pt: {
    wrapper: {},
    wrapper__invalid: {},
    wrapper__required: {},
    label: {},
    required: {},
    input: {},
    error: {},
    help: {},
    section: {},
  },

  /**
   * Empty rules configuration
   */
  rules: {},

  /**
   * Empty messages configuration
   */
  messages: {},
}
