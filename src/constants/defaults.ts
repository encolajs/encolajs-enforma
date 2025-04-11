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
 * Default configuration for the form kit
 */
export const DEFAULT_CONFIG: FormKitConfig = {
  /**
   * These props are going to be applied automatically
   * to the components rendered by the form kit
   */

  pt: {
    wrapper: {
      class: 'formkit-field-wrapper',
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
    //
    section: {
      class: 'formkit-section',
    },
  },

  // Default behavior configuration
  behavior: {
    validateOn: 'blur',
    showErrorsOn: 'touched',
  },

  /**
   * Additional validation rules
   */
  rules: {},

  /**
   * Default messages for validation errors
   * Leave empty to use the default messages
   */
  messages: {
    // required: 'This field is required',
  },

  // Expression configuration
  expressions: {
    delimiters: {
      start: '${',
      end: '}',
    },
  },

  // components
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
  },
}
