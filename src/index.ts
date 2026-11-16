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
export { errorCountText, visuallyHidden } from './utils/errorCountText'
export {
  createFormEmitter,
  type Emitter,
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
export { default as EnformaSchema } from './core/EnformaSchema.vue'
export { default as EnformaSection } from './core/EnformaSection.vue'
export { default as EnformaSectionItems } from './core/EnformaSectionItems.vue'
export { default as EnformaPanel } from './core/EnformaPanel'
export { default as EnformaTabs } from './core/EnformaTabs.vue'
export { default as EnformaCollapsible } from './core/EnformaCollapsible.vue'
export { default as EnformaErrorBadge } from './core/EnformaErrorBadge.vue'

// For a field component of one's own (`components.field`), and for a host's own controller
export { useEnformaField } from './core/useEnformaField'
export {
  useEnformaSection,
  fieldsInRenderOrder,
} from './core/useEnformaSection'
export type {
  EnformaSectionItem,
  EnformaSectionItemKind,
  EnformaSectionState,
} from './core/useEnformaSection'
export type { EnformaFieldProps } from './core/useEnformaField'
// For a component drawing panels of one's own (tabs, collapsibles)
export { useEnformaPanel } from './core/useEnformaPanel'
export type {
  EnformaPanelOptions,
  EnformaPanelState,
} from './core/useEnformaPanel'
// For a kit's own tabs and collapsible sections
export { useEnformaTabs } from './core/useEnformaTabs'
export type { EnformaTabsState } from './core/useEnformaTabs'
export { useEnformaCollapsible } from './core/useEnformaCollapsible'
export type { EnformaCollapsibleState } from './core/useEnformaCollapsible'
export { provideEnformaForm } from './core/provideEnformaForm'
export type { ProvideEnformaFormOptions } from './core/provideEnformaForm'

// Schema Builder
export { SchemaBuilder, useSchemaBuilder } from './schema-builder'
export type { SchemaBuilderMode } from './schema-builder'

// Presets will be imported directly by the users
// export { default as useDefaultPreset } from './presets/default'
// export { default as usePrimeVuePreset } from './presets/primevue'
// export { default as useVuetifyPreset } from './presets/vuetify'
// export { default as useQuasarPreset } from './presets/quasar'

// Validator types only (implementations must be imported explicitly)
export type { FormValidator } from './validators/types'
export { isFormValidator, isRulesObject } from './validators/helpers'

// Note: Validator implementations NOT exported from main entry point
// For tree-shaking, users must import validators explicitly:
// import { createEncolaValidator } from '@encolajs/enforma/validators/encola'
// import { createZodValidator } from '@encolajs/enforma/validators/zod'
// import { createYupValidator } from '@encolajs/enforma/validators/yup'
// import { createValibotValidator } from '@encolajs/enforma/validators/valibot'

// Type exports
export type {
  FormOptions,
  FormController,
  FieldOptions,
  FieldControllerExport,
  ValidationRules,
  FieldController,
  PendingHandle,
  FocusTarget,
  EventTrigger,
  FieldSchema,
  SectionSchema,
  ContentSchema,
  FormSchema,
} from './types'

export type {
  ConfigObject,
  DeepPartial,
  EnformaConfig,
  FieldPassThroughConfig,
  BehaviorConfig,
  ExpressionsConfig,
  ExpressionFunctions,
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
  formFieldSlotsKey,
  enformaConfigKey,
} from './constants/symbols'
export { DEFAULT_CONFIG } from './constants/defaults'

export { EnformaPlugin } from './EnformaPlugin'
