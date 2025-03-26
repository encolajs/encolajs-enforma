/**
 * Composable for managing form kit configuration
 */

import { inject, provide, computed, ComputedRef } from 'vue'
import { FormKitConfig, DeepPartial, ConfigProvider } from '../types/config'
import { mergeConfigs } from '../utils/configUtils'
import { DEFAULT_CONFIG } from '../constants/defaults'
import { formConfigKey } from '../constants/symbols'

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
