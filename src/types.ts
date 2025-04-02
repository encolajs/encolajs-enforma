import { ComputedRef, Ref } from 'vue'
import {
  CustomMessagesConfig,
  ValidatorFactory,
  ValidationRule,
} from '@encolajs/validator'

/**
 * Type definition for validation rules
 */
export type ValidationRules = Record<
  string,
  string | { name: string; rule: ValidationRule }[]
>

/**
 * Type definition for field state
 */
export interface FieldState {
  id: string
  path: string
  value: any
  error: string | null
  isDirty: boolean
  isTouched: boolean
  isValidating: boolean
  isValid?: boolean
  isVisited: boolean
  isFocused: boolean
  focusHandler?: () => void
}

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
}

/**
 * Return value of useFormState
 */
export interface FormStateReturn {
  fields: Map<string, FieldState>
  pathToId: Map<string, string>
  errors: Record<string, string[]>

  // Details for UI
  isSubmitting: Ref<boolean>
  isValidating: Ref<boolean>
  validationCount: Ref<number>
  submitted: Ref<boolean>
  isDirty: Ref<boolean>
  isTouched: Ref<boolean>
  isValid: ComputedRef<boolean>

  // Field management
  registerField: (name: string, existingId?: string) => FieldState
  unregisterField: (name?: string) => void
  touchField: (name: string) => void
  getField: (name: string) => FieldState | undefined

  // Form actions
  validate: () => Promise<boolean>
  validateField: (name: string, onlyIfTouched?: boolean) => Promise<boolean>
  reset: () => void
  submit: () => Promise<boolean>

  // Data access
  setFieldValue: (name: string, value: any, trigger?: EventTrigger) => void
  getFieldValue: (name: string) => any
  getData: () => any
  setData: (newData: Record<string, any>) => void
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
export interface FieldReturn {
  // Field value and state
  value: any
  error: string | null
  isDirty: boolean
  isTouched: boolean
  isValidating: boolean
  isVisited: boolean
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
