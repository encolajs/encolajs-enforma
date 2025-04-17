// Core setup
export { default as createEnforma } from './createFormKit'
export { setGlobalConfig, getGlobalConfig } from './utils/useConfig'

// Core composables
export { useValidation } from './utils/useValidation'
export { useField } from './headless/useField'
export { useRepeatable } from './headless/useRepeatable'
export { useForm } from './headless/useForm'
export { useConfig } from './utils/useConfig'
export { useFormConfig } from './utils/useFormConfig'
export { useTranslation } from './utils/useTranslation'
export { useDynamicProps } from './utils/useDynamicProps'

// Utilities
export { mergeConfigs, deepMerge } from './utils/configUtils'
export { default as applyTransformers } from './utils/applyTransformers'
export { debounce } from './utils/debounce'
export * from './utils/helpers'
export { 
  createFormEmitter, 
  globalFormEmitter, 
  type FormEvents,
  type FormEventType 
} from './utils/events'

// Headless components
export { default as HeadlessForm } from './headless/HeadlessForm'
export { default as HeadlessField } from './headless/HeadlessField'
export { default as HeadlessRepeatable } from './headless/HeadlessRepeatable'

// Presets will be imported directly by the users
// export { default as defaultPreset } from './presets/default'
// export { default as primevuePreset } from './presets/primevue'

// Type exports
export type {
  FormOptions,
  FormController,
  FieldOptions,
  FieldController,
  ValidationRules,
  FieldState,
  EventTrigger,
  FieldSchema,
  FormSectionSchema,
  EnformaSchema
} from './types'

export type {
  ConfigObject,
  DeepPartial,
  EnformaConfig,
  FieldPassThroughConfig,
  BehaviorConfig,
  ExpressionsConfig,
  ComponentsConfig,
  ConfigProvider,
  UseConfigReturn
} from './utils/useConfig'

// Re-export essential validator types
export {
  ValidationRule,
  ValidatorFactory,
  Validator,
} from '@encolajs/validator'

// Constants
export { formStateKey, formConfigKey, formContextKey } from './constants/symbols'
export { DEFAULT_CONFIG } from './constants/defaults'

export { default as createFormKit } from './createFormKit'
