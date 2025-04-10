import { type messageFormatter } from '@encolajs/validator'
/**
 * Default configuration values for the form kit
 */

import { FormKitConfig } from '@/utils/useConfig'
import FormKitField from '../core/FormKitField.vue'
import FormKitSection from '../core/FormKitSection.vue'
import FormKitRepeatable from '../core/FormKitRepeatable.vue'
import FormKitRepeatableTable from '../core/FormKitRepeatableTable.vue'
import FormKitRepeatableAddButton from '../core/FormKitRepeatableAddButton.vue'
import FormKitRepeatableRemoveButton from '../core/FormKitRepeatableRemoveButton.vue'
import FormKitRepeatableMoveUpButton from '../core/FormKitRepeatableMoveUpButton.vue'
import FormKitRepeatableMoveDownButton from '../core/FormKitRepeatableMoveDownButton.vue'
import FormKitSubmitButton from '../core/FormKitSubmitButton.vue'
import FormKitResetButton from '../core/FormKitResetButton.vue'
import FormKitSchema from '../core/FormKitSchema.vue'

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
    input: {},
    // Props for error messages
    error: {
      class: 'formkit-error',
    },
    help: {
      class: 'formkit-help',
    },
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

  // CSS classes configuration
  classes: {
    field: {
      wrapper: 'formkit-field-wrapper',
      label: 'formkit-label',
      required: 'formkit-label-required',
      error: 'formkit-error',
      help: 'formkit-help',
      input: 'formkit-input',
    },
    section: {
      wrapper: 'formkit-section',
      title: 'formkit-section-title',
    },
    repeatable: {
      wrapper: 'formkit-repeatable-wrapper',
      table: 'formkit-repeatable-table',
      table_th: '',
      table_td: '',
      add_button: 'formkit-repeatable-add-button',
      remove_button: 'formkit-repeatable-remove-button',
      move_up_button: 'formkit-repeatable-move-up-button',
      move_down_button: 'formkit-repeatable-move-down-button',
      actions: 'formkit-repeatable-actions',
      table_actions: 'formkit-repeatable-table-actions',
    },
    buttons: {
      submit: 'formkit-submit-button',
      reset: 'formkit-reset-button',
    },
    form: {
      actions: 'formkit-actions',
    },
  },
}
