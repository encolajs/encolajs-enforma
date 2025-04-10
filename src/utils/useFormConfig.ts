/**
 * Utility for accessing form configuration in components
 */

import { inject, computed } from 'vue'
import { formConfigKey } from '@/constants/symbols'
import { FormKitConfig, useConfig } from './useConfig'
import { DEFAULT_CONFIG } from '@/constants/defaults'
import { _get, deepMerge } from './configUtils'

/**
 * Composable for accessing form configuration in components
 * This ensures that components use the form configuration provided by the FormKit component
 * rather than the global configuration
 *
 * @returns An object with the form configuration and a helper function to get config values by path
 */
export function useFormConfig(localConfig?: object) {
  // Inject the form configuration from the parent FormKit component
  const config = useConfig(localConfig).config.value
  const formConfig = inject<FormKitConfig>(formConfigKey, config)

  /**
   * Get a configuration value by path with a default value if the path doesn't exist
   *
   * @param path The path to the configuration value (e.g., 'classes.field.wrapper')
   * @param defaultValue The default value to return if the path doesn't exist
   * @returns The configuration value at the specified path, or the default value
   */
  const getConfig = <T = any>(
    path: string,
    defaultValue?: T
  ): T | undefined => {
    return _get<T>(formConfig, path, defaultValue)
  }

  return {
    formConfig,
    getConfig,
  }
}
