import type { FormValidator } from './types'

export function isFormValidator(obj: any): obj is FormValidator {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.validate === 'function' &&
    typeof obj.validatePath === 'function' &&
    typeof obj.getErrors === 'function' &&
    typeof obj.getErrorsForPath === 'function' &&
    typeof obj.getDependentFields === 'function' &&
    typeof obj.clearErrorsForPath === 'function' &&
    typeof obj.reset === 'function'
  )
}

export function isRulesObject(obj: any): obj is Record<string, string> {
  return (
    obj &&
    typeof obj === 'object' &&
    !isFormValidator(obj) &&
    Object.values(obj).every((v) => typeof v === 'string')
  )
}
