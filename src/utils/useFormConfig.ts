/**
 * Utility for accessing form configuration in components
 */

import { inject, ComputedRef } from 'vue'
import { formConfigKey } from '@/constants/symbols'
import { EnformaConfig, useConfig } from './useConfig'
import { pathUtils } from '@/utils/helpers'

/**
 * Composable for accessing form configuration in components
 * This ensures that components use the form configuration provided by the Enforma component
 * rather than the global configuration
 *
 * @returns An object with the form configuration and a helper function to get config values by path
 */
export function useFormConfig(injectFormConfig = true) {
  let formConfig: EnformaConfig | undefined

  // Inject the form configuration from the parent Enforma component
  // If not available, fallback to the base config
  if (injectFormConfig) {
    const injectedConfig = inject<ComputedRef<EnformaConfig>>(formConfigKey)
    formConfig = injectedConfig?.value
  }

  if (!formConfig) {
    formConfig = useConfig()
  }

  /**
   * Get a configuration value by path with a default value if the path doesn't exist
   *
   * @param path The path to the configuration value (e.g., 'pt.field')
   * @param defaultValue The default value to return if the path doesn't exist
   * @returns The configuration value at the specified path, or the default value
   */
  const getConfig = <T = any>(
    path: string,
    defaultValue?: T
  ): T | null | undefined => {
    return pathUtils.get<T>(formConfig, path, defaultValue)
  }

  /**
   * Get the pass-through props at a path (e.g., 'pt.submit') to bind on a component.
   * The `as` key is left out because Enforma uses it to pick which component to
   * render. Forwarding it would clash with UI libraries that have their own `as` prop
   * (e.g., Nuxt UI's UButton would render a nested button).
   *
   * @param path The path to the pass-through configuration
   * @returns The pass-through props without the `as` key
   */
  const getPassThroughProps = (path: string): Record<string, any> => {
    const passThroughProps = { ...(getConfig<Record<string, any>>(path) || {}) }
    delete passThroughProps.as
    return passThroughProps
  }

  return {
    formConfig,
    getConfig,
    getPassThroughProps,
  }
}
