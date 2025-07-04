// Core setup
export { setGlobalConfig, getGlobalConfig } from './utils/useConfig'

// Core composables
export { useValidation } from './utils/useValidation'
export { useField } from './headless/useField'
export { useRepeatable } from './headless/useRepeatable'
export { useForm } from './headless/useForm'
export { useConfig } from './utils/useConfig'
export { useFormConfig } from './utils/useFormConfig'
export { useTranslation } from './utils/useTranslation'

// Utilities
export { mergeConfigs, deepMerge } from './utils/configUtils'
export { default as applyTransformers } from './utils/applyTransformers'
export { debounce } from './utils/debounce'
export { evaluateSchema } from './utils/evaluateSchema'
export { evaluateCondition } from './utils/evaluateCondition'
export * from './utils/helpers'
export {
  createFormEmitter,
  globalFormEmitter,
  type FormEvents,
  type FormEventType,
} from './utils/events'

// Headless components
export { default as HeadlessForm } from './headless/HeadlessForm'
export { default as HeadlessField } from './headless/HeadlessField'
export { default as HeadlessRepeatable } from './headless/HeadlessRepeatable'

export { default as Enforma } from './core/Enforma.vue'
export { default as EnformaField } from './core/EnformaField.vue'
export { default as EnformaRepeatable } from './core/EnformaRepeatable.vue'
export { default as EnformaRepeatableAddButton } from './core/EnformaRepeatableAddButton.vue'
export { default as EnformaRepeatableRemoveButton } from './core/EnformaRepeatableRemoveButton.vue'
export { default as EnformaRepeatableMoveUpButton } from './core/EnformaRepeatableMoveUpButton.vue'
export { default as EnformaRepeatableMoveDownButton } from './core/EnformaRepeatableMoveDownButton.vue'
export { default as EnformaRepeatableTable } from './core/EnformaRepeatableTable.vue'
export { default as EnformaSubmitButton } from './core/EnformaSubmitButton.vue'
export { default as EnformaResetButton } from './core/EnformaResetButton.vue'
export { default as EnformaRequiredIndicator } from './core/EnformaRequiredIndicator.vue'

// Schema Builder
export { SchemaBuilder, useSchemaBuilder } from './schema-builder'
export type { SchemaBuilderMode } from './schema-builder'

// Presets will be imported directly by the users
// export { default as useDefaultPreset } from './presets/default'
// export { default as usePrimeVuePreset } from './presets/primevue'
// export { default as useVuetifyPreset } from './presets/vuetify'
// export { default as useQuasarPreset } from './presets/quasar'

// Type exports
export type {
  FormOptions,
  FormController,
  FieldOptions,
  FieldControllerExport,
  ValidationRules,
  FieldController,
  EventTrigger,
  FieldSchema,
  SectionSchema,
  FormSchema,
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
} from './utils/useConfig'

// Re-export essential validator types
export {
  ValidationRule,
  ValidatorFactory,
  Validator,
} from '@encolajs/validator'

// Constants
export {
  formControllerKey,
  formConfigKey,
  formContextKey,
  formSchemaKey,
} from './constants/symbols'
export { DEFAULT_CONFIG } from './constants/defaults'

export { EnformaPlugin } from './EnformaPlugin'
