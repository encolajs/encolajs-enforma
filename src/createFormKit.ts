import { App, Plugin } from 'vue'
import { FormKitConfig, DeepPartial } from './types/config'
import { setGlobalConfig } from './composables/useConfig'
import { DEFAULT_CONFIG } from './constants/defaults'
import { mergeConfigs } from './utils/configUtils'
import { useValidation } from './composables/useValidation'
import { messageFormatter } from '@encolajs/validator'

export interface FormKitPluginOptions {
  /**
   * Global configuration for the FormKit
   */
  config?: DeepPartial<FormKitConfig>

  /**
   * Custom validation rules
   * @see @encolajs/validator
   */
  validation_rules?: Record<string, any>

  /**
   * Custom validation messages
   * @see @encolajs/validator
   */
  validation_messages?: Record<string, string>

  /**
   * Custom validation messages
   * @see @encolajs/validator
   */
  validation_message_formatter?: messageFormatter
}

// Export a factory function for easier instantiation
export default function createFormKit(options: FormKitPluginOptions): Plugin {
  return {
    install(app: App): void {
      // Set global configuration by merging defaults with provided config
      const mergedConfig = mergeConfigs(DEFAULT_CONFIG, options.config || {})
      setGlobalConfig(mergedConfig)
      const validation = useValidation()
      const rules = options.validation_rules || {}
      const messages = options.validation_messages || {}
      Object.entries(rules).forEach(([ruleName, ruleFunction]) => {
        validation.registerRule(
          ruleName,
          ruleFunction,
          messages[ruleName] || ''
        )
      })
      Object.entries(messages).forEach(([ruleName, message]) => {
        if (!rules[ruleName]) {
          validation.registerRule(ruleName, () => true, message)
        }
      })
      if (options.validation_message_formatter) {
        validation.setMessageFormatter(options.validation_message_formatter)
      }
    },
  }
}
