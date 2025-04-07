import { ComputedRef, Ref } from 'vue'
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
export interface FormStateOptions {
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
