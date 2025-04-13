import { type messageFormatter } from '@encolajs/validator'
/**
 * Default configuration values for the form kit
 */

import { FormKitConfig } from '@/utils/useConfig'
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
 * Minimal default configuration for the form kit
 * This contains only the essential options needed for the form kit to work
 * Additional configuration is provided by presets
 */
export const DEFAULT_CONFIG: FormKitConfig = {
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
