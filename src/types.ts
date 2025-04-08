import { ComponentPublicInstance } from 'vue'
import {
  CustomMessagesConfig,
  ValidationRule,
  ValidatorFactory,
} from '@encolajs/validator'
import { FieldState, StateChanges } from './composables/useForm'

/**
 * Type definition for validation rules
 */
export type ValidationRules = Record<
  string,
  string | { name: string; rule: ValidationRule }[]
>

/**
 * Type for event triggers
 */
export type EventTrigger = 'input' | 'change' | 'blur'

/**
 * Form state options
 */
export interface FormOptions {
  /** Custom validator factory */
  validatorFactory?: ValidatorFactory
  /** Custom error messages */
  customMessages?: CustomMessagesConfig
  /** When to run validation */
  validateOn?: 'input' | 'change' | 'blur' | 'submit'
  /** Form submission handler */
  submitHandler?: (data: any) => Promise<void> | void
  /** Validation error callback */
  onValidationError?: (form: FormController) => void
  /** Submit success callback */
  onSubmitSuccess?: (data: any) => void
  /** Submit error callback */
  onSubmitError?: (error: any) => void
}

/**
 * Field options interface
 */
export interface FieldOptions {
  /** Validate field on component mount */
  validateOnMount?: boolean
  /** When to validate field, overrides form setting */
  validateOn?: 'input' | 'change' | 'blur' | 'submit' | null
}

/**
 * Field state return interface
 */
export interface FieldController {
  // Field value and state
  value: any
  error: string | null
  isDirty: boolean
  isTouched: boolean
  isValidating: boolean
  isFocused: boolean

  // Methods
  validate: () => Promise<boolean>
  reset: () => void

  // HTML binding helpers
  attrs: Record<string, any>
  events: Record<string, Function>

  // For arrays and custom field types
  name: string
}

export interface FormController {
  reset(): void

  values(): object

  errors(): Record<string, string[]>

  submit(): Promise<boolean>

  validate(): Promise<boolean>

  validateField(path: string): Promise<boolean>

  setFieldValue(
    path: string,
    value: any,
    validate?: boolean,
    stateChanges?: StateChanges
  ): Promise<void>

  getField(path: string): FieldState

  removeField(path: string): void

  hasField(path: string): boolean

  add(arrayPath: string, index: number, item: any): void

  remove(arrayPath: string, index: number): void

  move(arrayPath: string, fromIndex: number, toIndex: number): void

  sort(arrayPath: string, callback: (a: any, b: any) => number): void

  [key: string]: any
}

/**
 * Represents the schema definition for a single form field
 */
export interface FieldSchema {
  /**
   * The component type that is used to render this field
   */
  wrapper: string

  /**
   * The field type that maps to a registered component in the field registry
   */
  type: string

  /**
   * The section this field belongs to, used for organizing fields into groups
   */
  section?: string

  /**
   * Conditional expression to determine if the field should be shown
   * Can be a string containing an expression referencing form state: "${form.country === 'US'}"
   */
  if?: string

  /**
   * Label text for the field
   */
  label?: string

  /**
   * Help text to display alongside the field
   */
  help?: string

  /**
   * Whether the field is required
   * Note: This is for UI purposes - actual validation is defined in validation_rules
   */
  required?: boolean

  /**
   * Props to apply to the entire field component (wrapper)
   */
  props?: Record<string, any>

  /**
   * Props to apply to the label component
   */
  label_props?: Record<string, any>

  /**
   * Props to apply to the input component
   */
  input_props?: Record<string, any>

  /**
   * Props to apply to the help text component
   */
  help_props?: Record<string, any>

  /**
   * Props to apply to the error message component
   */
  error_props?: Record<string, any>

  /**
   * For repeatable fields (arrays), whether this field represents a repeatable group
   */
  is_repeatable?: boolean

  /**
   * For repeatable fields, the minimum number of items allowed
   */
  min_items?: number

  /**
   * For repeatable fields, the maximum number of items allowed
   */
  max_items?: number

  /**
   * For repeatable fields, the definition of fields within each repeatable item
   */
  subfields?: Record<string, FieldSchema>

  /**
   * Default value for the field
   */
  default_value?: any

  /**
   * Component to use for this field, alternative to using 'type'
   * Allows direct component references
   */
  component?: string | ComponentPublicInstance

  /**
   * Custom transformers to apply to this field
   * Used in the transformer pipeline
   */
  transformers?: string[]

  /**
   * Additional custom configuration specific to this field
   */
  config?: Record<string, any>

  /**
   * Allow any other properties to be included in the field schema
   */
  [key: string]: any
}

export interface FormSectionSchema {
  /**
   * The label for the section
   */
  title: string

  title_component: string

  title_props: Record<string, any>

  section: string

  priority: number
}

export interface FormKitSchema {
  [key: string]: FieldSchema | FormSectionSchema
}
