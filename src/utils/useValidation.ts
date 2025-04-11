import {
  ValidatorFactory,
  Validator,
  ValidationRule,
  messageFormatter,
  CustomMessagesConfig,
} from '@encolajs/validator'
import { ValidationRules } from '@/types'
import { safeExecute } from './helpers'

/**
 * Interface for the return value of useValidation
 */
interface ValidationComposable {
  registerRule: (
    name: string,
    ruleClassOrValidationFunction: ValidationRule | Function,
    defaultErrorMessage: string
  ) => ValidatorFactory
  setMessageFormatter: (formatter: messageFormatter) => void
  makeValidator: (
    rules: ValidationRules,
    customMessages?: CustomMessagesConfig
  ) => Validator
  factory: ValidatorFactory
}

/**
 * Composable for validation integration
 */
export function useValidation(): ValidationComposable {
  // Create a validator factory instance
  const factory = new ValidatorFactory()

  /**
   * Register a custom validation rule
   */
  function registerRule(
    name: string,
    ruleClassOrValidationFunction: any,
    defaultErrorMessage: string
  ): ValidatorFactory {
    return factory.register(
      name,
      ruleClassOrValidationFunction,
      defaultErrorMessage
    )
  }

  /**
   * Set a custom message formatter
   */
  function setMessageFormatter(formatter: messageFormatter): void {
    // The ValidatorFactory handles this internally
    // Note: This assumes ValidatorFactory has _defaultMessageFormatter accessible
    // If it's private, you may need a proper method to set it

    // @ts-expect-error _defaultMessageFormatter is private
    ;(factory as ValidatorFactory)._defaultMessageFormatter = formatter
  }

  /**
   * Create a validator with rules and messages
   * Uses safeExecute to handle any potential errors in the validation setup
   */
  function makeValidator(
    rules: ValidationRules,
    customMessages: CustomMessagesConfig = {}
  ): Validator {
    return safeExecute(
      () => factory.make(rules, customMessages),
      'validation setup',
      factory.make({}, {}), // Provide a fallback empty validator if there's an error
      true
    )
  }

  return {
    registerRule,
    setMessageFormatter,
    makeValidator,
    factory,
  }
}
