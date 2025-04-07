// Core composables
export { useValidation } from './composables/useValidation'
export { useField } from './composables/useField'
export { useRepeatable } from './composables/useRepeatable'
export { useForm } from './composables/useForm'

// Type exports
export type {
  FormOptions,
  FormController,
  FieldOptions,
  FieldController,
  ValidationRules,
  FieldState,
  EventTrigger,
} from './types'

// Components
export { default as HeadlessForm } from './components/headless/HeadlessForm'
export { default as HeadlessField } from './components/headless/HeadlessField'
export { default as HeadlessRepeatable } from './components/headless/HeadlessRepeatable'

// Re-export essential validator types
export {
  PlainObjectDataSource,
  ValidationRule,
  ValidatorFactory,
  Validator,
} from '@encolajs/validator'
export type { DataSourceInterface } from '@encolajs/validator'
