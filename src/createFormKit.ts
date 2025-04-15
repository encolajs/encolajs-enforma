import { App, Plugin } from 'vue'
import { DeepPartial, EnformaConfig, setGlobalConfig } from './utils/useConfig'
import { DEFAULT_CONFIG } from './constants/defaults'
import { deepMerge, mergeConfigs } from './utils/configUtils'
import { useValidation } from './utils/useValidation'
import { fallbackTranslate } from './utils/useTranslation'
import useDefaultPreset from './presets/default'

function configureValidation(options: DeepPartial<EnformaConfig>) {
  const validation = useValidation()
  const rules = options.rules || {}
  const messages = options.messages || {}
  Object.entries(rules).forEach(([ruleName, ruleFunction]) => {
    validation.registerRule(ruleName, ruleFunction, messages[ruleName] || '')
  })
  Object.entries(messages).forEach(([ruleName, message]) => {
    if (!rules[ruleName]) {
      validation.registerRule(ruleName, () => true, message)
    }
  })
  if (options.errorMessageFormatter) {
    validation.setMessageFormatter(options.errorMessageFormatter)
  }
}

// Export a factory function for easier instantiation
export default function createEnforma(options: EnformaConfig): Plugin {
  return {
    install(app: App): void {
      // Set global configuration by merging defaults with provided config
      const mergedConfig = deepMerge(DEFAULT_CONFIG, options || {})
      mergedConfig.translator =
        app.config.globalProperties.$t || fallbackTranslate
      setGlobalConfig(mergedConfig)

      // Apply default preset
      useDefaultPreset()

      // Configure validation
      configureValidation(options)

      // inject the translator
      if (!app.config.globalProperties.$t) {
        app.config.globalProperties.$t = fallbackTranslate
      }
    },
  }
}
