/**
 * Type definitions related to form fields
 */

import { FormStateReturn } from '../index'

/**
 * Base field definition in form schema
 */
export interface FieldSchema {
  type: string
  name: string
  label?: string
  section?: string
  if?: string | boolean
  required?: boolean
  disabled?: boolean | string
  visible?: boolean | string
  default?: any
  props?: Record<string, any>
  input_props?: Record<string, any>
  label_props?: Record<string, any>
  error_props?: Record<string, any>
  help_props?: Record<string, any>
  wrapper_props?: Record<string, any>
  help_text?: string
  placeholder?: string
  readonly?: boolean
  [key: string]: any
}

/**
 * Repeatable field schema with subfields
 */
export interface RepeatableFieldSchema extends FieldSchema {
  type: 'repeatable'
  min_items?: number
  max_items?: number
  add_label?: string
  remove_label?: string
  item_label?: string | ((index: number) => string)
  subfields: Record<string, FieldSchema>
  default?: any[]
}

/**
 * Group field schema with subfields
 */
export interface GroupFieldSchema extends FieldSchema {
  type: 'group'
  subfields: Record<string, FieldSchema>
  default?: Record<string, any>
}

/**
 * Form field wrapper props
 */
export interface FieldWrapperProps {
  name: string
  label?: string
  required?: boolean
  help_text?: string
  error?: string | null
  disabled?: boolean
  readonly?: boolean
  class?: string
  label_props?: Record<string, any>
  error_props?: Record<string, any>
  help_props?: Record<string, any>
  wrapper_props?: Record<string, any>
  [key: string]: any
}

/**
 * Props common to all field types
 */
export interface BaseFieldProps {
  id?: string
  name: string
  label?: string
  value?: any
  default?: any
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  help_text?: string
  error?: string | null
  class?: string
  onChange?: (value: any) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: any
}

/**
 * Field render context for component selection
 */
export interface FieldRenderContext {
  form: Record<string, any>
  errors: Record<string, string[]>
  formState: FormStateReturn
  context: Record<string, any>
  section?: string
  path?: string
  [key: string]: any
}

/**
 * Field descriptor for dynamic rendering
 */
export interface FieldDescriptor {
  schema: FieldSchema
  path: string
  section?: string
  condition?: string | boolean
  visible: boolean
  component: string | object
  props: Record<string, any>
  componentProps?: Record<string, Record<string, any>>
  context: FieldRenderContext
  [key: string]: any
}

/**
 * Type guard for repeatable field schema
 */
export function isRepeatableField(
  field: FieldSchema
): field is RepeatableFieldSchema {
  return field.type === 'repeatable' && 'subfields' in field
}

/**
 * Type guard for group field schema
 */
export function isGroupField(field: FieldSchema): field is GroupFieldSchema {
  return field.type === 'group' && 'subfields' in field
}

/**
 * Field option for select, radio, checkbox fields
 */
export interface FieldOption {
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}

/**
 * Options array or options object for select fields
 */
export type FieldOptions =
  | FieldOption[]
  | Record<string, string>
  | string[]
  | number[]
  | boolean[]

/**
 * Form field schema with optional validation rules
 */
export interface FormFieldsSchema {
  fields: Record<string, FieldSchema>
  validation_rules?: Record<string, string>
  validation_messages?: Record<string, string>
}

/**
 * Field registration for the field registry
 */
export interface FieldRegistration {
  type: string
  component: any
  props?: Record<string, any>
  transform?: (schema: FieldSchema, context: any) => Record<string, any>
}
