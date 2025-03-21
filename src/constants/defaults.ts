/**
 * Default configuration values for the form kit
 */

import { FormKitConfig } from '../types/config'

/**
 * Default configuration for the form kit
 */
export const DEFAULT_CONFIG: FormKitConfig = {
  /**
   * These props are going to be applied automatically
   * to the components rendered by the form kit
   */

  props: {
    wrapper: {
      class: 'formkit-field-wrapper',
    },
    // Props for labels
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
    syncOn: 'blur',
    showErrorsOn: 'touched',
    autoTrimValues: true,
    autoCommitOnValid: true,
  },

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
}
