/**
 * Composable for managing form kit configuration
 */
import { computed, ComputedRef, inject, provide } from 'vue'
import { mergeConfigs } from './configUtils'
import { DEFAULT_CONFIG } from '../constants/defaults'
import { formConfigKey } from '../constants/symbols'
import { messageFormatter } from '@encolajs/validator'

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

/**
 * Configuration for field components
 */
export interface FieldPropsConfig {
  wrapper: ConfigObject
  label: ConfigObject
  required: ConfigObject
  input: ConfigObject
  error: ConfigObject
  help: ConfigObject
  section: ConfigObject

  [key: string]: any
}

/**
 * Configuration for form behavior
 */
export interface BehaviorConfig {
  validateOn: 'input' | 'change' | 'blur' | 'submit'
  showErrorsOn: 'touched' | 'dirty' | 'focus' | 'always'

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
 * Complete form kit configuration
 */
export interface FormKitConfig {
  pt: FieldPropsConfig
  behavior: BehaviorConfig
  rules?: Record<string, Function>
  messages?: Record<string, string>
  errorMessageFormatter?: messageFormatter
  expressions: ExpressionsConfig

  [key: string]: any
}

/**
 * Configuration providers can be objects or functions
 */
export type ConfigProvider =
  | DeepPartial<FormKitConfig>
  | (() => DeepPartial<FormKitConfig>)
// Store global configuration
let globalConfig: DeepPartial<FormKitConfig> = DEFAULT_CONFIG

/**
 * Set the global configuration for all forms
 */
export function setGlobalConfig(config: DeepPartial<FormKitConfig>): void {
  globalConfig = config
}

/**
 * Get the global configuration
 */
export function getGlobalConfig(): DeepPartial<FormKitConfig> {
  return globalConfig
}

/**
 * Interface for the return value of useConfig
 */
export interface UseConfigReturn {
  config: ComputedRef<FormKitConfig>
  extendConfig: (config: DeepPartial<FormKitConfig>) => FormKitConfig
  provideConfig: (config: DeepPartial<FormKitConfig>) => void
}

/**
 * Composable for working with form kit configuration
 */
export function useConfig(localConfig?: ConfigProvider): UseConfigReturn {
  // Resolve local config
  const resolvedLocalConfig =
    typeof localConfig === 'function' ? localConfig() : localConfig || {}

  // Try to inject existing config from a parent component
  const injectedConfig = inject<FormKitConfig | undefined>(
    formConfigKey,
    undefined
  )

  // Compute the final configuration by merging defaults, global, injected, and local
  const config = computed<FormKitConfig>(() => {
    return mergeConfigs<FormKitConfig>(
      DEFAULT_CONFIG,
      globalConfig,
      injectedConfig || {},
      resolvedLocalConfig
    )
  })

  /**
   * Extends the current configuration with additional configuration
   */
  function extendConfig(
    additionalConfig: DeepPartial<FormKitConfig>
  ): FormKitConfig {
    return mergeConfigs<FormKitConfig>(config.value, additionalConfig)
  }

  /**
   * Provides the configuration to child components
   */
  function provideConfig(
    additionalConfig: DeepPartial<FormKitConfig> = {}
  ): void {
    const providedConfig = extendConfig(additionalConfig)
    provide<FormKitConfig>(formConfigKey, providedConfig)
  }

  return {
    config,
    extendConfig,
    provideConfig,
  }
}
