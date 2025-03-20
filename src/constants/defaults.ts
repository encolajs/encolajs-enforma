/**
 * Default configuration values for the form kit
 */

import { FormKitConfig } from '../types/config'

/**
 * Default configuration for the form kit
 */
export const DEFAULT_CONFIG: FormKitConfig = {
  // Default props for common components
  fieldProps: {
    // Props for field wrappers
    wrapper: {
      class: 'formkit-field-wrapper',
    },
    // Props for labels
    label: {
      class: 'formkit-label',
      required: {
        class: 'formkit-label-required',
        text: '*',
      },
    },
    // Props for input components
    input: {
      class: 'formkit-input',
    },
    // Props for error messages
    error: {
      class: 'formkit-error',
    },
    // Props for help text
    help: {
      class: 'formkit-help',
    },
    // Props for section containers
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

  // Default field type mappings
  fieldTypes: {
    // Default field configuration (applied to all fields)
    default: {
      component: 'FormKitInput',
      props: {},
    },

    // Text input fields
    text: {
      component: 'FormKitInput',
      props: {
        type: 'text',
      },
    },
    email: {
      component: 'FormKitInput',
      props: {
        type: 'email',
      },
    },
    password: {
      component: 'FormKitInput',
      props: {
        type: 'password',
      },
    },
    number: {
      component: 'FormKitInput',
      props: {
        type: 'number',
      },
    },

    // Selection fields
    select: {
      component: 'FormKitSelect',
      props: {},
    },
    checkbox: {
      component: 'FormKitCheckbox',
      props: {},
    },
    radio: {
      component: 'FormKitRadio',
      props: {},
    },

    // Complex fields
    textarea: {
      component: 'FormKitTextarea',
      props: {},
    },
    repeatable: {
      component: 'FormKitRepeatable',
      props: {},
    },
  },

  // Message options
  messages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    default: 'This field is invalid',
  },

  // Expression configuration
  expressions: {
    delimiters: {
      start: '${',
      end: '}',
    },
    conditionals: {
      // Whether to allow complex expressions that could have side effects
      allowComplex: false,
      // Maximum time in ms an expression can take to evaluate
      timeout: 50,
    },
  },

  // Components for different parts of the form
  components: {
    // Used for rendering different field types
    field: {
      wrapper: 'FormKitFieldWrapper',
    },

    // Used for rendering different input types
    input: {
      text: 'FormKitTextInput',
      number: 'FormKitNumberInput',
      email: 'FormKitEmailInput',
      password: 'FormKitPasswordInput',
      select: 'FormKitSelectInput',
      checkbox: 'FormKitCheckboxInput',
      radio: 'FormKitRadioInput',
      textarea: 'FormKitTextareaInput',
    },
  },
}
