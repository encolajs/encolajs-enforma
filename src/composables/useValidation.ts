import { ref, reactive } from 'vue'
import { ValidatorFactory } from '@encolajs/validator'
import { Validator } from '@encolajs/validator'
import { ValidationRule } from '@encolajs/validator'
import { messageFormatter, CustomMessagesConfig } from '@encolajs/validator'
import { ValidationRules } from '../types.js'

/**
 * Type definition for validation rule implementation
 */
type ValidationRuleImplementation =
  | (new (params?: any[]) => ValidationRule)
  | ((
      value: any,
      path?: string,
      datasource?: any
    ) => boolean | Promise<boolean>)

/**
 * Interface for the return value of useValidation
 */
interface validationComposable {
  registerRule: (
    name: string,
    ruleClassOrValidationFunction: ValidationRuleImplementation,
    defaultErrorMessage: string
  ) => ValidatorFactory
  setMessageFormatter: (formatter: messageFormatter) => void
  makeValidator: (
    rules: ValidationRules,
    customMessages?: CustomMessagesConfig
  ) => Validator,
  factory: ValidatorFactory
}

export function useValidation(): validationComposable {
  // Create a validator factory instance
  const factory = new ValidatorFactory()

  /**
   * Register a custom validation rule
   */
  function registerRule(
    name: string,
    ruleClassOrValidationFunction: ValidationRuleImplementation,
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
   *
   * @param formatter - Custom message formatter function
   */
  function setMessageFormatter(formatter: messageFormatter): void {
    // The ValidatorFactory handles this internally
    // Note: This assumes ValidatorFactory has _defaultMessageFormatter accessible
    // If it's private, you may need a proper method to set it

    // @ts-expect-error _defaultMessageFormatter is private
    (factory as ValidatorFactory)._defaultMessageFormatter = formatter
  }

  /**
   * Create a validator with rules and messages
   *
   * @param rules - Validation rules
   * @param customMessages - Custom error messages
   * @returns A new validator instance
   */
  function makeValidator(
    rules: ValidationRules,
    customMessages: CustomMessagesConfig = {}
  ): Validator {
    return factory.make(rules, customMessages)
  }

  return {
    registerRule,
    setMessageFormatter,
    makeValidator,
    factory,
  }
}
