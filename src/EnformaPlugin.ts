import { App, Plugin } from 'vue'
import { DeepPartial, EnformaConfig, setGlobalConfig } from './utils/useConfig'
import { DEFAULT_CONFIG } from './constants/defaults'
import { deepMerge, mergeConfigs } from './utils/configUtils'
import { useValidation } from './utils/useValidation'
import { fallbackTranslate } from './utils/useTranslation'
import useDefaultPreset from './presets/default'
import { enformaConfigKey } from './constants/symbols'
import { createEncolaValidator } from './validators/encolaValidator'

/**
 * Configure EncolaJS Validator instance
 * - add rules Record<string(name of rule), Function(validator rule factory)>
 * - overwrite default validator messages
 * - set the message formatter (eg: if we are using translation)
 */
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

export const EnformaPlugin: Plugin = {
  install(app: App, options: EnformaConfig = {} as EnformaConfig): void {
    const mergedConfig = deepMerge(DEFAULT_CONFIG, options || {})
    mergedConfig.translator =
      app.config.globalProperties.$t || fallbackTranslate

    if (!mergedConfig.createEncolaValidation) {
      mergedConfig.createEncolaValidation = createEncolaValidator
    }

    setGlobalConfig(mergedConfig)

    app.provide(enformaConfigKey, mergedConfig)

    useDefaultPreset()

    // Configure validation
    configureValidation(options || {})

    // Inject the translator
    if (!app.config.globalProperties.$t) {
      app.config.globalProperties.$t = fallbackTranslate
    }
  },
}
