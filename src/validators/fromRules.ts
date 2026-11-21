import type {
  ValidatorFactory,
  CustomMessagesConfig,
} from '@encolajs/validator'
import type { FormValidator } from './types'
import type { EnformaConfig } from '@/utils/useConfig'
import { useValidation } from '@/utils/useValidation'

/**
 * The validator checking rules of @encolajs/validator (`{ email: 'required|email' }`): made by
 * the factory given, else by the plugin's `createEncolaValidation`, else by a factory of its own
 */
export function validatorFromRules(
  rules: Record<string, string>,
  customMessages?: CustomMessagesConfig,
  enformaConfig?: Pick<EnformaConfig, 'createEncolaValidation'> | null,
  validatorFactory?: ValidatorFactory
): FormValidator {
  if (validatorFactory) {
    return validatorFactory.make(rules, {
      ...(customMessages || {}),
    }) as unknown as FormValidator
  }
  if (enformaConfig?.createEncolaValidation) {
    return enformaConfig.createEncolaValidation(rules, customMessages)
  }
  return useValidation().factory.make(rules, {
    ...(customMessages || {}),
  }) as unknown as FormValidator
}

/**
 * Warns, in development, that a form given a validator leaves out its schema's rules, on the
 * paths given
 */
export function warnSchemaRulesLeftOut(paths: string[]): void {
  if (process.env.NODE_ENV === 'production') return
  console.warn(
    `[Enforma] The schema's \`rules\` (${paths.join(
      ', '
    )}) are left out: the form's \`validator\` checks the form. Put them in the validator, or give the form no validator`
  )
}
