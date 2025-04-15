import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { DEFAULT_CONFIG } from '../../src/constants/defaults'
import { formConfigKey } from '../../src/constants/symbols'
import {
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '../../src/utils/useConfig'
import useDefaultPreset from '../../src/presets/default'

/**
 * Creates a mounted component with the necessary configuration for testing
 * components in isolation.
 *
 * @param component The component to test
 * @param props Props to pass to the component
 * @param config Optional configuration to override the default configuration
 * @param slots Optional slot content
 * @returns A mounted component with the necessary configuration
 */
export function mountTestComponent(
  component: any,
  props: Record<string, any> = {},
  config: Partial<EnformaConfig> = {},
  slots: Record<string, string> = {}
) {
  // Reset global config to default
  setGlobalConfig(DEFAULT_CONFIG)

  // Apply default preset
  useDefaultPreset()

  // Get the current config after applying the preset
  const currentConfig = getGlobalConfig()

  // Merge with any additional config provided
  const mergedConfig = { ...currentConfig, ...config }

  return mount(component, {
    props,
    slots,
    global: {
      provide: {
        [formConfigKey]: mergedConfig,
        ...(config.global?.provide || {}),
      },
    },
  })
}
