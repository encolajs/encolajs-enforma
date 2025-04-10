// Core composables
export { useValidation } from './utils/useValidation'
export { useField } from './headless/useField'
export { useRepeatable } from './headless/useRepeatable'
export { useForm } from './headless/useForm'

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
export { default as HeadlessForm } from './headless/HeadlessForm'
export { default as HeadlessField } from './headless/HeadlessField'
export { default as HeadlessRepeatable } from './headless/HeadlessRepeatable'

// Re-export essential validator types
export {
  ValidationRule,
  ValidatorFactory,
  Validator,
} from '@encolajs/validator'
