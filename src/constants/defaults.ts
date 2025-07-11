/**
 * Default configuration values for the form kit
 */

import { EnformaConfig } from '@/utils/useConfig'
import cloneFn from '@/utils/cloneFn'

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
    cloneFn,
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
   * These components are used when determining
   * what to render inside forms when schema is being used
   * (eg: each schema item comes with a `component` field
   */
  components: {
    field: null,
    section: 'div', // to render a form section
    repeatable: null, // to render a repeatable
    repeatableTable: null, // to render a repeatable table
    repeatableAddButton: null, // to render a "add" button on a repeatable field
    repeatableRemoveButton: null, // to render a "remove" button on a repeatable item
    repeatableMoveUpButton: null, // to render a "move up" button on a repeatable item
    repeatableMoveDownButton: null, // to render a "move down" button on a repeatable item
    submitButton: null, // to render the "submit" button on a form
    resetButton: null, // to render the "reset" button on a form
    schema: 'div', // to render a "schema" type of component
  },

  /**
   * Empty pass-through configuration
   * Pass-through props will be provided by presets
   */
  pt: {
    /**
     * props to be passed to the wrapper component of field (eg: EnformaField)
     */
    wrapper: {},
    /**
     * props to be added to the wrapper component when the field is invalid
     */
    wrapper__invalid: {},
    /**
     * props to be added to the wrapper component when the field is required
     */
    wrapper__required: {},
    /**
     * props to be passed to the label
     */
    label: {},
    /**
     * props to be passed to the required indicator component
     */
    required: {
      content: '*',
    },
    /**
     * props to be passed to the input field
     */
    input: {},
    /**
     * props to be passed to the error message div
     */
    error: {
      renderAsHtml: false,
    },
    /**
     * props to be passed to the help/instructions div
     */
    help: {
      renderAsHtml: false,
    },
    /**
     * props to be passed to section components
     */
    section: {},
    /**
     * props to be passed to schema components
     */
    schema: {},
    /**
     * props to be passed to submit button components
     */
    submit: {},
    /**
     * props to be passed to reset button components
     */
    reset: {},
  },

  /**
   * Rules configuration
   * This is where you add your own validation rules in the form of
   * Record<string(name of the rule), Function(factory for creating the rule)>
   */
  rules: {},

  /**
   * Custom validation messages
   * This is where you add your custom validation
   * rules that are globally applicable
   * (eg: overwrite default messages from EncolaJS Validator)
   */
  messages: {},
}
