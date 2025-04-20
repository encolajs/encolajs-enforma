/**
 * Composable for managing form kit configuration
 */
import { mergeConfigs, _get } from './configUtils'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { messageFormatter } from '@encolajs/validator'
import { resolveValue } from './helpers'

/**
 * Represents a generic configuration object
 */
export type ConfigObject = Record<string, any>

/**
 * Makes all properties in T optional and recursive
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

interface ComponentProps {
  class?: string
  [key: string]: any
}

/**
 * Pass-Through configuration for field components
 * These props are attached automatically to each component
 * @see /src/constants/defaults.ts for details
 */
export interface FieldPassThroughConfig {
  // for the EnformaField
  wrapper: ComponentProps
  wrapper__invalid: ComponentProps
  wrapper__required: ComponentProps
  label: ComponentProps
  required: ComponentProps
  input: ComponentProps
  error: ComponentProps
  help: ComponentProps

  // for EnformaRepeatable
  repeatable?: {
    wrapper: ComponentProps
    items: ComponentProps
    add: ComponentProps
    remove: ComponentProps
    moveUp: ComponentProps
    moveDown: ComponentProps
    actions: ComponentProps
    itemActions: ComponentProps
  }

  // for EnformaRepeatableTable
  repeatable_table?: {
    wrapper?: ComponentProps // inherits from repeatable
    table: ComponentProps
    th?: ComponentProps
    td?: ComponentProps
    actionsTd?: ComponentProps
    actions?: ComponentProps // inherits from repeatable
    itemActions?: ComponentProps // inherits from repeatable
    add?: ComponentProps // inherits from repeatable
    remove?: ComponentProps // inherits from repeatable
    moveUp?: ComponentProps // inherits from repeatable
    moveDown?: ComponentProps // inherits from repeatable
  }

  // this is for other components
  section: ComponentProps
  schema: ComponentProps

  // options for custom components
  [key: string]: any
}

/**
 * Configuration for form behavior
 */
export interface BehaviorConfig {
  validateOn: 'input' | 'change' | 'blur' | 'submit'

  [key: string]: any
}

/**
 * Configuration for expression handling
 */
export interface ExpressionsConfig {
  delimiters: {
    start: string
    end: string
  }
}

/**
 * Components used for auto-rendering, like
 * <Enforma :schema=schema> or <EnformaSection section="sidebar">
 */
export interface ComponentsConfig {
  field: any
  section: any
  repeatable: any
  repeatableTable: any
  repeatableAddButton: any
  repeatableRemoveButton: any
  repeatableMoveUpButton: any
  repeatableMoveDownButton: any
  submitButton: any
  resetButton: any
  schema: any
}

/**
 * Complete form kit configuration
 */
export interface EnformaConfig {
  pt: FieldPassThroughConfig
  behavior: BehaviorConfig
  rules?: Record<string, Function>
  messages?: Record<string, string>
  errorMessageFormatter?: messageFormatter
  expressions: ExpressionsConfig
  components: ComponentsConfig
  transformers?: {
    [key: string]: Function[]
  }
  [key: string]: any
}

/**
 * Configuration providers can be objects or functions
 */
export type ConfigProvider =
  | DeepPartial<EnformaConfig>
  | (() => DeepPartial<EnformaConfig>)

// Store global configuration
let globalConfig: DeepPartial<EnformaConfig> = DEFAULT_CONFIG

/**
 * Set the global configuration for all forms
 */
export function setGlobalConfig(config: DeepPartial<EnformaConfig>): void {
  globalConfig = config
}

/**
 * Get the global configuration
 */
export function getGlobalConfig(): DeepPartial<EnformaConfig> {
  return globalConfig
}

/**
 * Composable for working with form kit configuration
 */
export function useConfig(localConfig?: ConfigProvider): EnformaConfig {
  // Resolve local config using our helper function
  const resolvedLocalConfig = resolveValue(localConfig) || {}

  // Compute the final configuration by merging defaults, global, and local
  const config = mergeConfigs<EnformaConfig>(
    globalConfig, // global config (plugin level)
    resolvedLocalConfig // local config (form level)
  )

  return config
}
